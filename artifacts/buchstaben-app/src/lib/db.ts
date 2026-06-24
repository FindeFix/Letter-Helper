import { supabase } from "./supabase";
import type { Letter, Settings, Example } from "./types";

// ─── Letters ───────────────────────────────────────────────────────────────

export async function getLetter(id: string): Promise<Letter | null> {
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Letter | null;
}

export async function upsertLetter(letter: Partial<Letter> & { id: string }): Promise<void> {
  const { error } = await supabase.from("letters").upsert(letter, { onConflict: "id" });
  if (error) throw error;
}

export async function updateLetterExamples(id: string, examples: Example[]): Promise<void> {
  const { error } = await supabase
    .from("letters")
    .update({ examples })
    .eq("id", id);
  if (error) throw error;
}

// ─── Settings ──────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "global")
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    // Create default settings row if missing
    await supabase.from("settings").insert({ id: "global", disabled_letters: [] });
    return { id: "global", disabled_letters: [] };
  }
  return data as Settings;
}

export async function updateDisabledLetters(disabled: string[]): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ id: "global", disabled_letters: disabled }, { onConflict: "id" });
  if (error) throw error;
}

// ─── Storage ───────────────────────────────────────────────────────────────

export async function uploadLetterAudio(
  letterId: string,
  blob: Blob
): Promise<string> {
  const path = `${letterId}/pronunciation.webm`;
  const { error } = await supabase.storage
    .from("letter-audio")
    .upload(path, blob, { upsert: true, contentType: "audio/webm" });
  if (error) throw error;
  const { data } = supabase.storage.from("letter-audio").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadExampleImage(
  letterId: string,
  slotId: number,
  blob: Blob
): Promise<string> {
  const path = `examples/${letterId}/${slotId}.jpg`;
  const { error } = await supabase.storage
    .from("examples")
    .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
  if (error) throw error;
  const { data } = supabase.storage.from("examples").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadExampleAudio(
  letterId: string,
  slotId: number,
  blob: Blob
): Promise<string> {
  const path = `examples/${letterId}/${slotId}-audio.webm`;
  const { error } = await supabase.storage
    .from("examples")
    .upload(path, blob, { upsert: true, contentType: "audio/webm" });
  if (error) throw error;
  const { data } = supabase.storage.from("examples").getPublicUrl(path);
  return data.publicUrl;
}
