import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Settings2 } from "lucide-react";
import { useAppContext } from "@/lib/AppContext";
import { ALPHABET } from "@/lib/types";
import FilterModal from "@/components/FilterModal";
import LetterRow from "@/components/LetterRow";

export default function HomePage() {
  const { settings, loading } = useAppContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const disabledSet = new Set(settings.disabled_letters || []);
  const visibleLetters = ALPHABET.filter(letter => !disabledSet.has(letter));

  return (
    <div className="min-h-[100dvh] pb-24 pt-12 px-6 max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-10 pl-4 pr-2">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Buchstaben lernen</h1>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="p-4 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow text-slate-500 hover:text-primary active:scale-95"
          aria-label="Einstellungen"
        >
          <Settings2 size={32} />
        </button>
      </div>

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
      />
    </div>
  );
}
