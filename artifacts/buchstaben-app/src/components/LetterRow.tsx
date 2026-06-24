import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LetterRow({ letter, index }: { letter: string; index: number }) {
  const upper = letter.toUpperCase();
  const lower = letter.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: "spring", bounce: 0.4 }}
    >
      <Link 
        to={`/${letter}`}
        className="block w-full bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-6">
          <span className="text-7xl sm:text-[90px] font-bold text-slate-800 leading-none tracking-tight">
            {upper} {lower}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
