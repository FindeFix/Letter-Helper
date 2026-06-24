import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Mic } from "lucide-react";
import { getLetter, upsertLetter, updateLetterExamples, uploadLetterAudio } from "@/lib/db";
import { type Letter, type Example } from "@/lib/types";
import { useAppContext } from "@/lib/AppContext";
import { useToast } from "@/hooks/use-toast";
import ExampleSlot from "@/components/ExampleSlot";
import AudioRecorder from "@/components/AudioRecorder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LetterDetailPage() {
  const { letter } = useParams<{ letter: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useAppContext();
  const mode = settings.mode;

  const [data, setData] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecordingLetter, setIsRecordingLetter] = useState(false);

  const upper = letter?.toUpperCase() || "";
  const lower = upper.toLowerCase();

  const loadLetter = async () => {
    try {
      let l = await getLetter(upper);
      if (!l) {
        l = { id: upper, upper, lower, audio_url: null, examples: [] };
        await upsertLetter(l);
      }
      setData(l);
    } catch (error) {
      toast({ title: "Fehler beim Laden", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (upper) loadLetter();
  }, [upper]);

  const playLetterAudio = () => {
    if (data?.audio_url) {
      new Audio(data.audio_url).play();
    }
  };

  const handleSaveLetterAudio = async (blob: Blob) => {
    try {
      const url = await uploadLetterAudio(upper, blob);
      await upsertLetter({ id: upper, upper, lower, audio_url: url });
      setData(prev => prev ? { ...prev, audio_url: url } : null);
      setIsRecordingLetter(false);
      toast({ title: "Audio gespeichert!" });
    } catch (error) {
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    }
  };

  const handleUpdateExamples = async (examples: Example[]) => {
    setData(prev => prev ? { ...prev, examples } : null);
    await updateLetterExamples(upper, examples);
  };

  if (loading || !data) {
    return (
      <div className="h-[100dvh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const letterButton = (
    <button
      onClick={() => {
        if (mode === "learn") {
          playLetterAudio();
        } else {
          if (!data.audio_url) setIsRecordingLetter(true);
          else playLetterAudio();
        }
      }}
      className="relative flex items-center justify-center px-12 py-4 rounded-[3rem] bg-white shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer select-none"
    >
      <span className="text-[80px] sm:text-[100px] font-bold text-slate-800 leading-none">
        {upper} {lower}
      </span>
      {data.audio_url && (
        <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
          <Volume2 size={24} />
        </div>
      )}
    </button>
  );

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Sticky header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md active:scale-95 text-slate-500 transition-all"
        >
          <ArrowLeft size={32} />
        </button>

        {mode === "editor" && data.audio_url ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{letterButton}</DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 rounded-2xl">
              <DropdownMenuItem
                onClick={() => setIsRecordingLetter(true)}
                className="text-lg p-4 rounded-xl cursor-pointer"
              >
                <Mic className="mr-3" size={24} />
                Neu aufnehmen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          letterButton
        )}

        <div className="w-16" />
      </header>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="grid grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 30 }).map((_, i) => {
            const example = data.examples.find(e => e.id === i);
            return (
              <ExampleSlot
                key={i}
                slotId={i}
                letterId={upper}
                example={example}
                mode={mode}
                onUpdate={(ex) => {
                  const newEx = [...data.examples.filter(e => e.id !== i), ex];
                  handleUpdateExamples(newEx);
                }}
                onDelete={() => {
                  handleUpdateExamples(data.examples.filter(e => e.id !== i));
                }}
              />
            );
          })}
        </div>
      </div>

      {isRecordingLetter && (
        <AudioRecorder
          onSave={handleSaveLetterAudio}
          onCancel={() => setIsRecordingLetter(false)}
          title={`Aussprache für ${upper}`}
        />
      )}
    </div>
  );
}
