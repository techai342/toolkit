import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface PeerDevice {
  peerId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  joinedAt: number;
}

export interface FileTransferMeta {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  totalChunks: number;
  chunkSize: number;
  senderName: string;
}

export interface TransferProgress {
  id: string;
  fileName: string;
  fileSize: number;
  transferredBytes: number;
  progressPercent: number; // 0 - 100
  speedBytesPerSec: number;
  etaSeconds: number;
  status: 'pending' | 'transferring' | 'completed' | 'cancelled' | 'error';
  direction: 'sending' | 'receiving';
  blobUrl?: string;
  error?: string;
}

export interface TextSnippet {
  id: string;
  text: string;
  senderName: string;
  isSelf: boolean;
  timestamp: number;
}

export interface WebRTCFileTransferEvents {
  onPeerJoin?: (peer: PeerDevice) => void;
  onPeerLeave?: (peerId: string) => void;
  onConnectionStatus?: (status: 'disconnected' | 'connecting' | 'connected') => void;
  onFileOffer?: (meta: FileTransferMeta, accept: () => void, reject: () => void) => void;
  onTransferProgress?: (progress: TransferProgress) => void;
  onTransferComplete?: (progress: TransferProgress) => void;
  onTextSnippet?: (snippet: TextSnippet) => void;
  onError?: (err: Error) => void;
}

const CHUNK_SIZE = 64 * 1024; // 64 KB per chunk
const BUFFERED_AMOUNT_THRESHOLD = 2 * 1024 * 1024; // 2 MB low threshold
const MAX_BUFFERED_AMOUNT = 16 * 1024 * 1024; // 16 MB max buffer

export class WebRTCFileTransferEngine {
  public peerId: string;
  public device: PeerDevice;
  public roomId: string;
  
  private channel: RealtimeChannel | null = null;
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private remotePeer: PeerDevice | null = null;
  private isInitiator = false;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private events: WebRTCFileTransferEvents;

  // Active receiving transfers
  private receivingChunks = new Map<string, { meta: FileTransferMeta; chunks: Uint8Array[]; receivedBytes: number; startTime: number; lastCalcTime: number; lastBytes: number }>();
  // Active sending transfers
  private activeSendTransfers = new Map<string, { file: File; cancelled: boolean }>();

  constructor(roomId: string, events: WebRTCFileTransferEvents = {}) {
    this.roomId = roomId;
    this.events = events;
    this.peerId = `peer_${Math.random().toString(36).substring(2, 9)}`;
    this.device = this.detectDeviceInfo(this.peerId);
  }

  private detectDeviceInfo(peerId: string): PeerDevice {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
    else if (/mobile|android|iphone/i.test(ua)) deviceType = 'mobile';

    let browser = 'Browser';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';

    let os = 'PC';
    if (ua.includes('Windows')) os = 'Windows PC';
    else if (ua.includes('Mac')) os = 'Mac';
    else if (ua.includes('Android')) os = 'Android Phone';
    else if (ua.includes('iPhone')) os = 'iPhone';
    else if (ua.includes('Linux')) os = 'Linux';

    return {
      peerId,
      deviceName: `${os} (${browser})`,
      deviceType,
      browser,
      joinedAt: Date.now(),
    };
  }

  public async start(): Promise<void> {
    this.events.onConnectionStatus?.('connecting');

    // Setup Supabase Realtime signaling channel
    this.channel = supabase.channel(`p2p_room_${this.roomId}`, {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    this.channel.on('broadcast', { event: 'signal' }, async ({ payload }) => {
      await this.handleSignal(payload);
    });

    this.channel.on('broadcast', { event: 'peer_join' }, async ({ payload }) => {
      if (payload.peerId === this.peerId) return;
      this.remotePeer = payload;
      this.events.onPeerJoin?.(payload);
      // We are the existing peer, so announce ourselves and initiate WebRTC offer
      await this.channel?.send({
        type: 'broadcast',
        event: 'peer_announce',
        payload: this.device,
      });

      this.isInitiator = true;
      await this.initiatePeerConnection();
    });

    this.channel.on('broadcast', { event: 'peer_announce' }, async ({ payload }) => {
      if (payload.peerId === this.peerId) return;
      this.remotePeer = payload;
      this.events.onPeerJoin?.(payload);
      // The other peer is already there and will initiate offer
      this.isInitiator = false;
    });

    this.channel.on('broadcast', { event: 'peer_leave' }, ({ payload }) => {
      if (payload.peerId === this.remotePeer?.peerId) {
        this.cleanupPeerConnection();
        this.events.onPeerLeave?.(payload.peerId);
        this.events.onConnectionStatus?.('disconnected');
      }
    });

    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Announce our presence in room
        await this.channel?.send({
          type: 'broadcast',
          event: 'peer_join',
          payload: this.device,
        });
      }
    });
  }

  private async initiatePeerConnection(): Promise<void> {
    this.createPeerConnection();

    if (!this.pc) return;

    // Create Data Channel
    this.dataChannel = this.pc.createDataChannel('p2p_file_channel', {
      ordered: true,
    });
    this.setupDataChannel(this.dataChannel);

    // Create and send SDP offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    await this.sendSignal({
      type: 'offer',
      sdp: offer,
      senderId: this.peerId,
    });
  }

  private createPeerConnection(): void {
    if (this.pc) return;

    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    });

    this.pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await this.sendSignal({
          type: 'candidate',
          candidate: event.candidate.toJSON(),
          senderId: this.peerId,
        });
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      if (!this.pc) return;
      if (this.pc.iceConnectionState === 'connected' || this.pc.iceConnectionState === 'completed') {
        this.events.onConnectionStatus?.('connected');
      } else if (
        this.pc.iceConnectionState === 'disconnected' ||
        this.pc.iceConnectionState === 'failed' ||
        this.pc.iceConnectionState === 'closed'
      ) {
        this.events.onConnectionStatus?.('disconnected');
      }
    };

    // When remote peer creates data channel (non-initiator side)
    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };
  }

  private setupDataChannel(dc: RTCDataChannel): void {
    dc.binaryType = 'arraybuffer';
    dc.bufferedAmountLowThreshold = BUFFERED_AMOUNT_THRESHOLD;

    dc.onopen = () => {
      this.events.onConnectionStatus?.('connected');
    };

    dc.onclose = () => {
      this.events.onConnectionStatus?.('disconnected');
    };

    dc.onerror = (e) => {
      console.error('DataChannel error:', e);
    };

    dc.onmessage = (event) => {
      this.handleIncomingDataChannelMessage(event.data);
    };
  }

  private async sendSignal(payload: any): Promise<void> {
    if (!this.channel) return;
    await this.channel.send({
      type: 'broadcast',
      event: 'signal',
      payload,
    });
  }

  private async handleSignal(data: any): Promise<void> {
    if (!data || data.senderId === this.peerId) return;

    if (data.type === 'offer') {
      this.createPeerConnection();
      if (!this.pc) return;

      await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

      // Flush queued candidates
      while (this.pendingCandidates.length > 0) {
        const candidate = this.pendingCandidates.shift();
        if (candidate) await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }

      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);

      await this.sendSignal({
        type: 'answer',
        sdp: answer,
        senderId: this.peerId,
      });
    } else if (data.type === 'answer') {
      if (this.pc) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        // Flush queued candidates
        while (this.pendingCandidates.length > 0) {
          const candidate = this.pendingCandidates.shift();
          if (candidate) await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    } else if (data.type === 'candidate') {
      if (this.pc && this.pc.remoteDescription) {
        await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else {
        this.pendingCandidates.push(data.candidate);
      }
    }
  }

  private handleIncomingDataChannelMessage(data: string | ArrayBuffer): void {
    if (typeof data === 'string') {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'file_offer') {
          const meta: FileTransferMeta = msg.meta;
          this.events.onFileOffer?.(
            meta,
            () => this.acceptFile(meta),
            () => this.rejectFile(meta.id)
          );
        } else if (msg.type === 'file_accept') {
          this.startSendingFile(msg.transferId);
        } else if (msg.type === 'file_reject') {
          const transfer = this.activeSendTransfers.get(msg.transferId);
          if (transfer) {
            this.events.onTransferProgress?.({
              id: msg.transferId,
              fileName: transfer.file.name,
              fileSize: transfer.file.size,
              transferredBytes: 0,
              progressPercent: 0,
              speedBytesPerSec: 0,
              etaSeconds: 0,
              status: 'cancelled',
              direction: 'sending',
              error: 'Recipient rejected the file transfer',
            });
            this.activeSendTransfers.delete(msg.transferId);
          }
        } else if (msg.type === 'file_cancel') {
          this.receivingChunks.delete(msg.transferId);
          this.events.onTransferProgress?.({
            id: msg.transferId,
            fileName: 'Transfer',
            fileSize: 0,
            transferredBytes: 0,
            progressPercent: 0,
            speedBytesPerSec: 0,
            etaSeconds: 0,
            status: 'cancelled',
            direction: 'receiving',
            error: 'Sender cancelled the transfer',
          });
        } else if (msg.type === 'text_snippet') {
          this.events.onTextSnippet?.({
            id: msg.id,
            text: msg.text,
            senderName: msg.senderName || 'Peer',
            isSelf: false,
            timestamp: msg.timestamp || Date.now(),
          });
        }
      } catch (err) {
        console.error('Error parsing JSON message:', err);
      }
    } else if (data instanceof ArrayBuffer) {
      // Binary chunk packet:
      // Header: 12 bytes
      // [4 bytes: transferId hash]
      // [4 bytes: chunkIndex uint32]
      // [4 bytes: totalChunks uint32]
      if (data.byteLength < 12) return;
      const view = new DataView(data);
      const transferIdHash = view.getUint32(0);
      const chunkIndex = view.getUint32(4);
      const totalChunks = view.getUint32(8);
      const chunkData = new Uint8Array(data, 12);

      // Find receiving transfer by hash
      for (const [id, rec] of this.receivingChunks.entries()) {
        if (this.hashString(id) === transferIdHash) {
          rec.chunks[chunkIndex] = chunkData;
          rec.receivedBytes += chunkData.byteLength;

          const now = Date.now();
          const elapsedTotal = Math.max(0.1, (now - rec.startTime) / 1000);
          const speed = rec.receivedBytes / elapsedTotal;
          const remainingBytes = Math.max(0, rec.meta.size - rec.receivedBytes);
          const eta = speed > 0 ? remainingBytes / speed : 0;
          const progressPercent = Math.min(100, Math.round((rec.receivedBytes / rec.meta.size) * 100));

          const progress: TransferProgress = {
            id,
            fileName: rec.meta.name,
            fileSize: rec.meta.size,
            transferredBytes: rec.receivedBytes,
            progressPercent,
            speedBytesPerSec: Math.round(speed),
            etaSeconds: Math.round(eta),
            status: rec.receivedBytes >= rec.meta.size ? 'completed' : 'transferring',
            direction: 'receiving',
          };

          this.events.onTransferProgress?.(progress);

          // Check if file is completely received
          if (rec.receivedBytes >= rec.meta.size || chunkIndex === totalChunks - 1) {
            const completeBlob = new Blob(rec.chunks as BlobPart[], { type: rec.meta.mimeType || 'application/octet-stream' });
            const blobUrl = URL.createObjectURL(completeBlob);
            progress.blobUrl = blobUrl;
            progress.status = 'completed';
            this.receivingChunks.delete(id);
            this.events.onTransferComplete?.(progress);
          }
          break;
        }
      }
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return hash >>> 0;
  }

  public acceptFile(meta: FileTransferMeta): void {
    this.receivingChunks.set(meta.id, {
      meta,
      chunks: new Array(meta.totalChunks),
      receivedBytes: 0,
      startTime: Date.now(),
      lastCalcTime: Date.now(),
      lastBytes: 0,
    });

    this.sendControlMessage({
      type: 'file_accept',
      transferId: meta.id,
    });

    this.events.onTransferProgress?.({
      id: meta.id,
      fileName: meta.name,
      fileSize: meta.size,
      transferredBytes: 0,
      progressPercent: 0,
      speedBytesPerSec: 0,
      etaSeconds: 0,
      status: 'transferring',
      direction: 'receiving',
    });
  }

  public rejectFile(transferId: string): void {
    this.sendControlMessage({
      type: 'file_reject',
      transferId,
    });
  }

  public sendTextSnippet(text: string): TextSnippet | null {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') return null;

    const snippet: TextSnippet = {
      id: `snip_${Math.random().toString(36).substring(2, 9)}`,
      text,
      senderName: this.device.deviceName,
      isSelf: true,
      timestamp: Date.now(),
    };

    this.sendControlMessage({
      type: 'text_snippet',
      id: snippet.id,
      text: snippet.text,
      senderName: snippet.senderName,
      timestamp: snippet.timestamp,
    });

    return snippet;
  }

  public queueFile(file: File): string {
    const id = `xfer_${Math.random().toString(36).substring(2, 9)}`;
    this.activeSendTransfers.set(id, { file, cancelled: false });

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const meta: FileTransferMeta = {
      id,
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      totalChunks,
      chunkSize: CHUNK_SIZE,
      senderName: this.device.deviceName,
    };

    // Send offer to peer
    this.sendControlMessage({
      type: 'file_offer',
      meta,
    });

    this.events.onTransferProgress?.({
      id,
      fileName: file.name,
      fileSize: file.size,
      transferredBytes: 0,
      progressPercent: 0,
      speedBytesPerSec: 0,
      etaSeconds: 0,
      status: 'pending',
      direction: 'sending',
    });

    return id;
  }

  private async startSendingFile(transferId: string): Promise<void> {
    const item = this.activeSendTransfers.get(transferId);
    if (!item || !this.dataChannel || this.dataChannel.readyState !== 'open') return;

    const { file } = item;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const transferIdHash = this.hashString(transferId);

    let offset = 0;
    let chunkIndex = 0;
    const startTime = Date.now();
    let sentBytes = 0;

    const sendNextChunk = async (): Promise<void> => {
      if (item.cancelled || !this.dataChannel || this.dataChannel.readyState !== 'open') {
        this.activeSendTransfers.delete(transferId);
        return;
      }

      while (chunkIndex < totalChunks) {
        // Backpressure check: wait if buffer exceeds threshold
        if (this.dataChannel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
          await new Promise<void>((resolve) => {
            if (!this.dataChannel) return resolve();
            this.dataChannel.onbufferedamountlow = () => {
              if (this.dataChannel) this.dataChannel.onbufferedamountlow = null;
              resolve();
            };
          });
        }

        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await slice.arrayBuffer();

        // 12-byte header + chunk data
        const packet = new Uint8Array(12 + arrayBuffer.byteLength);
        const view = new DataView(packet.buffer);
        view.setUint32(0, transferIdHash);
        view.setUint32(4, chunkIndex);
        view.setUint32(8, totalChunks);
        packet.set(new Uint8Array(arrayBuffer), 12);

        this.dataChannel.send(packet.buffer);

        sentBytes += arrayBuffer.byteLength;
        offset += CHUNK_SIZE;
        chunkIndex++;

        const now = Date.now();
        const elapsed = Math.max(0.1, (now - startTime) / 1000);
        const speed = sentBytes / elapsed;
        const remainingBytes = Math.max(0, file.size - sentBytes);
        const eta = speed > 0 ? remainingBytes / speed : 0;
        const progressPercent = Math.min(100, Math.round((sentBytes / file.size) * 100));

        this.events.onTransferProgress?.({
          id: transferId,
          fileName: file.name,
          fileSize: file.size,
          transferredBytes: sentBytes,
          progressPercent,
          speedBytesPerSec: Math.round(speed),
          etaSeconds: Math.round(eta),
          status: chunkIndex >= totalChunks ? 'completed' : 'transferring',
          direction: 'sending',
        });
      }

      this.activeSendTransfers.delete(transferId);
      this.events.onTransferComplete?.({
        id: transferId,
        fileName: file.name,
        fileSize: file.size,
        transferredBytes: file.size,
        progressPercent: 100,
        speedBytesPerSec: Math.round(file.size / Math.max(0.1, (Date.now() - startTime) / 1000)),
        etaSeconds: 0,
        status: 'completed',
        direction: 'sending',
      });
    };

    sendNextChunk().catch((err) => {
      console.error('Error sending file chunk:', err);
    });
  }

  private sendControlMessage(data: any): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') return;
    try {
      this.dataChannel.send(JSON.stringify(data));
    } catch (e) {
      console.error('Error sending control message:', e);
    }
  }

  public isConnected(): boolean {
    return this.dataChannel?.readyState === 'open';
  }

  public getRemotePeer(): PeerDevice | null {
    return this.remotePeer;
  }

  private cleanupPeerConnection(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.remotePeer = null;
  }

  public destroy(): void {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'peer_leave',
        payload: { peerId: this.peerId },
      });
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.cleanupPeerConnection();
  }
}
