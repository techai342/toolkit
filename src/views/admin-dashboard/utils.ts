export const uploadMediaClientSide = async (
  file: File | Blob,
  pathPrefix: string,
): Promise<{ url: string }> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "divloq4oz";
  const apiKey = process.env.CLOUDINARY_API_KEY || "999667235587213";
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET || "hKQ5Q6x6bdJOflp14Nk_S-MGrkw";

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signatureString = `timestamp=${timestamp}${apiSecret}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Cloudinary upload error:", errText);
    throw new Error(`Cloudinary Upload Failed: ${errText}`);
  }
  const result = await res.json();
  return { url: result.secure_url };
};

export const uploadVideoClientSide = async (
  file: File | Blob,
): Promise<{ url: string }> => {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("Video must be 50MB or smaller.");
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "divloq4oz";
  const apiKey = process.env.CLOUDINARY_API_KEY || "999667235587213";
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET || "hKQ5Q6x6bdJOflp14Nk_S-MGrkw";

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signatureString = `timestamp=${timestamp}${apiSecret}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("resource_type", "video");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Cloudinary video upload error:", errText);
    throw new Error(`Cloudinary Video Upload Failed: ${errText}`);
  }
  const result = await res.json();
  return { url: result.secure_url };
};

export const uploadImageClientSide = async (
  file: File | Blob,
  pathPrefix: string,
): Promise<{ url: string }> => {
  const publicKey =
    process.env.IMAGEKIT_PUBLIC_KEY || "public_8ulBaGE6HasMRTYenvVihqllUm8=";
  const privateKey =
    process.env.IMAGEKIT_PRIVATE_KEY || "private_DBHLVLfKVktC1UhaxnMNjJ++5sc=";

  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const expire = Math.floor(Date.now() / 1000) + 60 * 30; // 30 mins

  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(privateKey);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  const dataBuffer = encoder.encode(token + expire);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    dataBuffer,
  );
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signature = signatureArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const formData = new FormData();
  formData.append("file", file);
  const fileExt =
    file instanceof File ? file.name.split(".").pop() || "tmp" : "jpg";
  formData.append(
    "fileName",
    `${pathPrefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`,
  );
  formData.append("publicKey", publicKey);
  formData.append("signature", signature);
  formData.append("expire", expire.toString());
  formData.append("token", token);
  formData.append("folder", "/yalo-assets");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("ImageKit upload error:", errText);
    throw new Error(`ImageKit Upload Failed: ${errText}`);
  }
  const result = await res.json();
  return { url: result.url };
};
