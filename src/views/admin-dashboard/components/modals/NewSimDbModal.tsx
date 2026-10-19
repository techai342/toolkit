import React, { useState } from "react";
import { X } from "lucide-react";

interface NewSimDbModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const NewSimDbModal: React.FC<NewSimDbModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      admin_username: "",
      channel_link: "",
      whatsapp_number: "",
      theme_color: "#00E5FF",
      main_website_link: "",
      font_family: "sans",
    }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {initialData ? "Edit Sim Database" : "Create New Sim Database"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Tool Name</label>
            <input
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3 mt-1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Admin Username</label>
            <input
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3 mt-1"
              value={formData.admin_username}
              onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Channel Link</label>
            <input
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3 mt-1"
              value={formData.channel_link}
              onChange={(e) => setFormData({ ...formData, channel_link: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Whatsapp Number</label>
            <input
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3 mt-1"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Main Website Link</label>
            <input
              className="w-full bg-black/40 border border-white/10 text-white rounded-xl p-3 mt-1"
              value={formData.main_website_link}
              onChange={(e) => setFormData({ ...formData, main_website_link: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Theme Color</label>
            <input
              type="color"
              className="w-full h-12 bg-black/40 border border-white/10 rounded-xl p-1 mt-1"
              value={formData.theme_color}
              onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
            />
          </div>
        </div>

        <button
          onClick={() => onSave(formData)}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl font-bold mt-6"
        >
          {initialData ? "Save Changes" : "Create Database"}
        </button>
      </div>
    </div>
  );
};
