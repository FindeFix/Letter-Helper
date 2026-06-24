import React, { useState } from "react";
import { type Example, type AppMode } from "@/lib/types";
import { Camera, Volume2, Mic, Image as ImageIcon, Trash2 } from "lucide-react";
import ImageCropModal from "./ImageCropModal";
import AudioRecorder from "./AudioRecorder";
import { uploadExampleAudio } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  slotId: number;
  letterId: string;
  example?: Example;
  mode: AppMode;
  onUpdate: (ex: Example) => void;
  onDelete: () => void;
}

export default function ExampleSlot({ slotId, letterId, example, mode, onUpdate, onDelete }: Props) {
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const { toast } = useToast();

  const playAudio = () => {
    if (example?.audio_url) {
      new Audio(example.audio_url).play();
    }
  };

  const handleImageUploaded = (url: string) => {
    onUpdate({ id: slotId, image_url: url, audio_url: example?.audio_url || "" });
  };

  const handleAudioSaved = async (blob: Blob) => {
    if (!example?.image_url) return;
    try {
      const url = await uploadExampleAudio(letterId, slotId, blob);
      onUpdate({ ...example, audio_url: url });
      toast({ title: "Audio gespeichert!" });
      setIsRecordOpen(false);
    } catch (err) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  // ── LEARN MODE ────────────────────────────────────────────────────────────
  if (mode === "learn") {
    if (!example?.image_url) {
      return (
        <div className="w-full aspect-square rounded-[2rem] bg-slate-200/40 border-2 border-dashed border-slate-300/50" />
      );
    }
    return (
      <button
        onClick={playAudio}
        className="group relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md active:scale-[0.97] transition-all bg-slate-100"
      >
        <img src={example.image_url} alt="Beispiel" className="w-full h-full object-cover" />
        {example.audio_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-primary shadow">
              <Volume2 size={28} />
            </div>
          </div>
        )}
      </button>
    );
  }

  // ── EDITOR MODE ───────────────────────────────────────────────────────────

  // Empty slot
  if (!example?.image_url) {
    return (
      <>
        <button
          onClick={() => setIsCropOpen(true)}
          className="w-full aspect-square rounded-[2rem] border-4 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 active:scale-95 transition-all cursor-pointer"
        >
          <Camera size={40} />
        </button>
        <ImageCropModal
          isOpen={isCropOpen}
          onClose={() => setIsCropOpen(false)}
          letterId={letterId}
          slotId={slotId}
          onUploadSuccess={handleImageUploaded}
        />
      </>
    );
  }

  // Filled slot — speaker click plays audio, card click opens dropdown
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition-all bg-slate-100">
            <img src={example.image_url} alt="Beispiel" className="w-full h-full object-cover" />
            {/* Speaker badge — click to play, stop propagation so dropdown doesn't open */}
            {example.audio_url && (
              <div
                role="button"
                onClick={(e) => { e.stopPropagation(); playAudio(); }}
                className="absolute top-3 right-3 w-10 h-10 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer z-10"
              >
                <Volume2 size={20} />
              </div>
            )}
            {/* Mic hint if no audio yet */}
            {!example.audio_url && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-slate-800">
                  <Mic size={32} />
                </div>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-2 rounded-2xl min-w-[200px]">
          <DropdownMenuItem
            onClick={() => setIsRecordOpen(true)}
            className="text-lg p-4 rounded-xl cursor-pointer"
          >
            <Mic className="mr-3" size={24} />
            {example.audio_url ? "Audio neu aufnehmen" : "Audio aufnehmen"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsCropOpen(true)}
            className="text-lg p-4 rounded-xl cursor-pointer"
          >
            <ImageIcon className="mr-3" size={24} />
            Bild ersetzen
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="text-lg p-4 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-3" size={24} />
            Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ImageCropModal
        isOpen={isCropOpen}
        onClose={() => setIsCropOpen(false)}
        letterId={letterId}
        slotId={slotId}
        onUploadSuccess={handleImageUploaded}
      />

      {isRecordOpen && (
        <AudioRecorder
          onSave={handleAudioSaved}
          onCancel={() => setIsRecordOpen(false)}
          title="Aussprache für Bild aufnehmen"
        />
      )}
    </>
  );
}
