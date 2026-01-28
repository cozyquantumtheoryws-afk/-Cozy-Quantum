import { load } from "https://deno.land/std@0.177.0/dotenv/mod.ts";

const ELEVEN_LABS_API_KEY = Deno.env.get("ELEVEN_LABS_API_KEY") || "sk_d0dcf856428ea9c7b7bda0a1e3af13dc23f85aa7c994b4ac";

async function generateSoundEffect(text: string, outputPath: string, duration: number = 25) {
  console.log(`Generating: "${text}" -> ${outputPath}`);
  
  const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: {
      "xi-api-key": ELEVEN_LABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      duration_seconds: duration, 
      prompt_influence: 0.5 
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error generating sound: ${response.status} - ${response.statusText}`, errorBody);
    return;
  }

  const audioBuffer = await response.arrayBuffer();
  await Deno.writeFile(outputPath, new Uint8Array(audioBuffer));
  console.log(`Successfully saved to ${outputPath}`);
}

async function main() {
    // 1. Quantum Foghorn Ambience (Loopable)
    await generateSoundEffect(
        "A low, haunting foghorn heard from a distance in a thick, mysterious fog. Gentle ocean waves lapping against a dock. atmospheric, ambient, mysterious, moody, low rumble, wet atmosphere, cinematic.", 
        "public/sounds/foghorn_ambience.mp3",
        20 
    );

    // 2. Eerie Noir Jazz Music
    await generateSoundEffect(
        "Slow, moody noir jazz saxophone and upright bass play a mysterious melody in a smoky room. Rain tapping on a window. Lo-fi, vintage, cozy mystery, Detective atmosphere.",
        "public/sounds/mystery_music.mp3",
        25 
    );
}

main();
