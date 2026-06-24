import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, RotateCcw, Check, X } from "lucide-react";

interface Props {
  onSave: (blob: Blob) => Promise<void>;
  onCancel: () => void;
  title: string;
}

export default function AudioRecorder({ onSave, onCancel, title }: Props) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [timer, setTimer] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setRecording(true);
      setTimer(0);
      setAudioBlob(null);

      timerInterval.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Mikrofon konnte nicht aktiviert werden.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      setRecording(false);
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
  };

  const handleSave = async () => {
    if (!audioBlob) return;
    setSaving(true);
    await onSave(audioBlob);
    setSaving(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center"
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
        >
          <div className="w-full flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <button 
              onClick={onCancel}
              disabled={recording || saving}
              className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center w-full py-10">
            {!audioBlob ? (
              <>
                <div className="text-5xl font-mono mb-8 text-slate-700">
                  {formatTime(timer)}
                </div>
                
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="w-32 h-32 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                  >
                    <Mic size={48} />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-32 h-32 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg hover:bg-slate-900 active:scale-95 transition-all animate-pulse"
                  >
                    <Square size={40} className="fill-current" />
                  </button>
                )}
                
                <p className="mt-8 text-lg text-slate-500 font-medium">
                  {!recording ? "Tippen zum Aufnehmen" : "Aufnahme läuft..."}
                </p>
              </>
            ) : (
              <div className="w-full flex flex-col items-center">
                <audio 
                  ref={audioRef}
                  src={URL.createObjectURL(audioBlob)} 
                  controls 
                  className="w-full mb-8 h-16 rounded-full"
                />
                
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setAudioBlob(null)}
                    disabled={saving}
                    className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <RotateCcw size={24} />
                    Neu
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Check size={28} />
                    {saving ? "Speichert..." : "Speichern"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
