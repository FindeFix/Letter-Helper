import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2 } from "lucide-react";
import { ALPHABET, type Settings } from "@/lib/types";
import { getSettings } from "@/lib/db";
import { isConfigured } from "@/lib/supabase";
import FilterModal from "@/components/FilterModal";
import LetterRow from "@/components/LetterRow";

export default function HomePage() {
  const configured = isConfigured();
  const [settings, setSettings] = useState<Settings>({ id: "global", disabled_letters: [] });
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const loadSettings = async () => {
    if (!configured) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const disabledSet = new Set(settings.disabled_letters || []);
  const visibleLetters = ALPHABET.filter(letter => !disabledSet.has(letter));

  return (
    <div className="min-h-[100dvh] pb-24 pt-12 px-6 max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-10 pl-4 pr-2">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Buchstaben lernen</h1>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="p-4 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow text-slate-500 hover:text-primary active:scale-95"
          aria-label="Filter"
        >
          <Settings2 size={32} />
        </button>
      </div>

      {!configured && (
        <div className="w-full mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem]">
          <p className="text-xl font-semibold text-amber-800 mb-1">Supabase noch nicht eingerichtet</p>
          <p className="text-lg text-amber-700">
            Trage <code className="bg-amber-100 px-1 rounded font-mono text-base">VITE_SUPABASE_URL</code> und{" "}
            <code className="bg-amber-100 px-1 rounded font-mono text-base">VITE_SUPABASE_ANON_KEY</code> in den Secrets ein,
            dann wird die App mit deiner Datenbank verbunden.
          </p>
        </div>
      )}

      {error && (
        <div className="w-full mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-[2rem]">
          <p className="text-lg font-semibold text-red-700">Verbindung fehlgeschlagen</p>
          <p className="text-base text-red-600">Bitte prüfe deine Supabase-Zugangsdaten.</p>
        </div>
      )}

      {loading ? (
        <div className="w-full flex flex-col gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 w-full bg-slate-200/50 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          <AnimatePresence>
            {visibleLetters.map((letter, index) => (
              <LetterRow key={letter} letter={letter} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        settings={settings}
        onSaved={loadSettings}
      />
    </div>
  );
}
