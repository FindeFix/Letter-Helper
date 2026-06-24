import React, { useState } from "react";
import { ALPHABET, type Settings } from "@/lib/types";
import { updateDisabledLetters } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaved: () => void;
}

export default function FilterModal({ isOpen, onClose, settings, onSaved }: Props) {
  const [disabled, setDisabled] = useState<Set<string>>(new Set(settings.disabled_letters));
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const toggleLetter = (l: string) => {
    const next = new Set(disabled);
    if (next.has(l)) next.delete(l);
    else next.add(l);
    setDisabled(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDisabledLetters(Array.from(disabled));
      toast({ title: "Gespeichert!" });
      onSaved();
      onClose();
    } catch (e) {
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-slate-50 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
        >
          <div className="px-8 py-6 bg-white flex justify-between items-center border-b border-slate-100">
            <h2 className="text-3xl font-bold text-slate-800">Buchstaben filtern</h2>
            <button 
              onClick={onClose}
              className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {ALPHABET.map(l => {
                const isActive = !disabled.has(l);
                return (
                  <button
                    key={l}
                    onClick={() => toggleLetter(l)}
                    className={`aspect-square rounded-3xl flex items-center justify-center text-4xl sm:text-5xl font-bold transition-all active:scale-95 shadow-sm ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'bg-white text-slate-300'
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-5 bg-primary text-white text-2xl font-bold rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              <Check size={32} />
              {saving ? "Speichert..." : "Speichern"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
