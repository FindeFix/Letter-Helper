import React, { useState, useRef } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check, X, Image as ImageIcon } from "lucide-react";
import { uploadExampleImage } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  letterId: string;
  slotId: number;
  onUploadSuccess: (url: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropModal({ isOpen, onClose, letterId, slotId, onUploadSuccess }: Props) {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const getCroppedImg = async () => {
    const image = imgRef.current;
    if (!image || !crop) return null;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Exact crop dimensions
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw crop onto canvas
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    if (!imgRef.current || !crop) return;
    
    setUploading(true);
    try {
      const blob = await getCroppedImg();
      if (!blob) throw new Error("Could not create cropped image");
      
      const url = await uploadExampleImage(letterId, slotId, blob);
      toast({ title: "Bild hochgeladen!" });
      onUploadSuccess(url);
      setImgSrc('');
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Fehler beim Hochladen", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setImgSrc('');
      onClose();
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
          className="bg-slate-50 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
        >
          <div className="px-8 py-6 bg-white flex justify-between items-center border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800">Bild hinzufügen</h2>
            <button 
              onClick={handleClose}
              disabled={uploading}
              className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
            {!imgSrc ? (
              <label className="w-full aspect-square max-w-sm border-4 border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="hidden"
                />
                <ImageIcon size={64} className="text-slate-400 mb-4" />
                <span className="text-xl font-bold text-slate-600">Bild auswählen</span>
              </label>
            ) : (
              <div className="w-full flex justify-center bg-black/5 rounded-2xl p-4">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  aspect={1}
                  className="max-h-[50vh]"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-h-[50vh] object-contain"
                  />
                </ReactCrop>
              </div>
            )}
          </div>

          {imgSrc && (
            <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-4">
              <button
                onClick={() => setImgSrc('')}
                disabled={uploading}
                className="px-6 py-4 bg-slate-100 text-slate-700 text-xl font-bold rounded-2xl hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
              >
                Zurück
              </button>
              <button
                onClick={handleSave}
                disabled={uploading || !crop}
                className="px-8 py-4 bg-primary text-white text-xl font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={24} />
                )}
                {uploading ? "Speichert..." : "Zuschneiden & Speichern"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
