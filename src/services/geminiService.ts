
import type { ImageSize } from '../types';

export const geminiService = {
  generateStoryScript: async (title: string, problem: string, resolution: string): Promise<string> => {
    console.log(`Generating story for ${title}...`);
    return new Promise(resolve => setTimeout(() => resolve(`Artie looked at the ${problem} and sighed. "Well," he said, "time to apply some quantum grease." He proceeded to implement the resolution: ${resolution}. The end.`), 1000));
  },
  
  generateStoryboardPrompts: async (_storyText: string): Promise<string[]> => {
      console.log("Generating prompts...");
      return ["Scene 1: Artie holding a wrench", "Scene 2: Quantum sparks flying"];
  },

  generateStoryboardImage: async (prompt: string): Promise<string> => {
      console.log(`Generating image for: ${prompt}`);
      return `https://via.placeholder.com/400x300?text=${encodeURIComponent(prompt.substring(0, 20))}`;
  },

  speakAsArtie: async (text: string): Promise<string> => {
      console.log(`Speaking: ${text}`);
      // Return a very short silent MP3 base64 or similar dummy data
      return "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; 
  },
  
  generateCover: async (prompt: string, size: ImageSize): Promise<string> => {
      console.log(`Generating cover: ${prompt} (${size})`);
      return "https://via.placeholder.com/300x400?text=Generated+Cover";
  }
};

export const decodeBase64 = (base64: string): ArrayBuffer => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

export const decodeAudioData = async (
    arrayBuffer: ArrayBuffer, 
    audioContext: AudioContext,
    sampleRate: number = 24000,
    channels: number = 1
): Promise<AudioBuffer> => {
    // In a real app, you might use decodeAudioData directly, but for raw PCM you need to createBuffer
    // The provided App.tsx calls this, implying it handles raw PCM or some custom format.
    // For this stub, we'll just wrap the standard decodeAudioData or create a silent buffer.
    try {
        return await audioContext.decodeAudioData(arrayBuffer);
    } catch {
        // Fallback for empty/invalid buffer in stub
        const buffer = audioContext.createBuffer(channels, sampleRate, sampleRate);
        return buffer;
    }
};
