import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Upload, Plus, Trash2, GripVertical } from "lucide-react";
import api from "../api/client";

export function Field({ label, children, hint }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-charcoal/45">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-primary" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function Toast({ message, type = "success", onClose }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className={`fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lift ${type === "error" ? "bg-red-500" : "bg-primary"}`}
          role="status"
        >
          {message}
          <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100" aria-label="Dismiss"><X size={14} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-charcoal/60 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className={`my-8 w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-3xl bg-white p-6 shadow-lift sm:p-8`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-charcoal">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-charcoal/50 transition hover:bg-gray-100" aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", text = "This action cannot be undone.", busy = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-6 text-sm text-charcoal/60">{text}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-outline !px-5 !py-2.5 !text-sm">Cancel</button>
        <button onClick={onConfirm} disabled={busy} className="btn-primary !bg-red-500 !px-5 !py-2.5 !text-sm hover:!bg-red-600 disabled:opacity-60">
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center text-sm text-charcoal/45">
      {text}
    </div>
  );
}

/** Image/video upload input with preview. Uploads via /api/admin/upload. */
export function UploadInput({ value, onChange, label = "Upload", folder = "nutrix/misc", accept = "image/*", aspect = "aspect-video", onUploaded }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const uploadFile = async (file) => {
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/admin/upload", form);
      onChange(data.url);
      onUploaded?.(data);
    } catch (e) {
      alert(e.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
      <button type="button" onClick={() => ref.current?.click()} className="group relative block w-full overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 transition hover:border-primary">
        {value ? (
          <div className={`${aspect} relative`}>
            <img src={value} alt="Upload preview" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center gap-2 bg-charcoal/50 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
              <Upload size={16} /> Replace
            </span>
          </div>
        ) : (
          <div className={`${aspect} flex flex-col items-center justify-center gap-2 text-charcoal/40`}>
            {busy ? <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" /> : <Upload size={26} />}
            <span className="text-sm">{busy ? "Uploading…" : label}</span>
          </div>
        )}
      </button>
    </div>
  );
}

/** Dynamic list editor (benefits, suitableFor, tags, qualifications, timeline…) */
export function ListEditor({ items = [], onChange, placeholder = "Add item" }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...(items || []), draft.trim()]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          className="input" placeholder={placeholder} />
        <button type="button" onClick={add} className="btn-primary shrink-0 !rounded-xl !px-4 !py-2"><Plus size={17} /></button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(items || []).map((item, i) => (
          <span key={`${item}-${i}`} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="opacity-60 hover:opacity-100" aria-label={`Remove ${item}`}>
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Drag-and-drop sortable list using native HTML5 DnD. */
export function SortableList({ items, onReorder, renderItem, getKey }) {
  const [dragIndex, setDragIndex] = useState(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={getKey(item)}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex === null || dragIndex === i) return;
            const next = [...items];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(i, 0, moved);
            onReorder(next);
            setDragIndex(null);
          }}
          className={`flex cursor-grab items-center gap-3 rounded-2xl border p-3 transition active:cursor-grabbing ${dragIndex === i ? "border-primary bg-primary/5 opacity-60" : "border-gray-200 bg-white hover:border-primary/40"}`}
        >
          <GripVertical size={18} className="shrink-0 text-charcoal/30" />
          <div className="min-w-0 flex-1">{renderItem(item)}</div>
        </div>
      ))}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = "bg-primary/10 text-primary" }) {
  return (
    <div className="card flex items-center gap-4 p-6">
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl p-3.5 ${color}`}>
        {Icon && <Icon size={24} />}
      </span>
      <div>
        <p className="font-heading text-2xl font-bold text-charcoal">{value}</p>
        <p className="text-sm text-charcoal/55">{label}</p>
      </div>
    </div>
  );
}
