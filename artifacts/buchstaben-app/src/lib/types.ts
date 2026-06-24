export interface Example {
  id: number;
  image_url: string;
  audio_url: string;
}

export interface Letter {
  id: string;
  upper: string;
  lower: string;
  audio_url: string | null;
  examples: Example[];
}

export interface Settings {
  id: string;
  disabled_letters: string[];
}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
