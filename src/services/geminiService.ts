
import type { ImageSize } from '../types';

export const geminiService = {
  generateStoryScript: async (title: string, problem: string, resolution: string): Promise<string> => {
    console.log(`Generating story for ${title}...`);
    
    const intros = [
      "You know, folks, another Tuesday in Observation Bay, another breach in the fabric of spacetime.",
      "I was just sitting down to my Earl Grey when the sensors went wild.",
      "The thing about quantum mechanics is, it never lets you finish your sandwich.",
      "So there I was, minding my own business, reorganizing my collection of spare event horizons.",
      "It started with a sound like a rubber duck falling down a staircase made of xylophones.",
      "Observation Bay is quiet usually, except when the laws of physics decide to take a personal day."
    ];
    
    const connectors = [
      `I looked over and saw that ${problem.toLowerCase()}`,
      `Turns out, ${problem.toLowerCase()}`,
      `The diagnostics confirmed it: ${problem.toLowerCase()}`,
      `My first thought was 'Oh boy', because ${problem.toLowerCase()}`,
      `Naturally, it was because ${problem.toLowerCase()}`
    ];
    
    const tools = [
      "So I grabbed my non-euclidean wrench.",
      "I dusted off the Reality Anchor.",
      "I had to recalibrate the Sonic Plunger.",
      "I reached for the probability mallet.",
      "I fired up the Heisenberg Compensator.",
      "I pulled out the old Quantum Duct Tape."
    ];
    
    const resolutions = [
      `It took a steady hand, but by ${resolution.toLowerCase()}, I managed to stabilize the field.`,
      `There was no other choice. I ended up ${resolution.toLowerCase()}. Works every time.`,
      `With a little bit of ${resolution.toLowerCase()}, the waveform smoothed right out.`,
      `A classic fix: ${resolution.toLowerCase()}. Good as new.`,
      `After ${resolution.toLowerCase()}, the readings returned to normal. Mostly.`
    ];

    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    return new Promise(resolve => setTimeout(() => 
      resolve(`${pick(intros)} ${pick(connectors)} ${pick(tools)} ${pick(resolutions)}`), 1000));
  },
  
  generateStoryboardPrompts: async (_storyText: string): Promise<string[]> => {
      console.log("Generating prompts...");
      return ["Scene 1: Artie holding a wrench", "Scene 2: Quantum sparks flying"];
  },

  generateStoryboardImage: async (prompt: string): Promise<string> => {
      console.log(`Generating image for: ${prompt}`);
      return `https://via.placeholder.com/400x300?text=${encodeURIComponent(prompt.substring(0, 20))}`;
  },

  speakAsArtie: async (text: string): Promise<ArrayBuffer> => {
      console.log(`Speaking: ${text}`);
      try {
        const projectUrl = import.meta.env.VITE_SUPABASE_URL;
        const functionUrl = `${projectUrl}/functions/v1/generate-audio`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error("Audio generation failed");
        
        return await response.arrayBuffer();

      } catch (e) {
        console.warn("Falling back to local mock audio due to error:", e);
        // Return a silent 1-second buffer (WAV header)
        const silentWavBase64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
        const binary_string = window.atob(silentWavBase64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
      }
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
