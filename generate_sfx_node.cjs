const fs = require('fs');
const https = require('https');

const ELEVEN_LABS_API_KEY = "sk_d0dcf856428ea9c7b7bda0a1e3af13dc23f85aa7c994b4ac";

async function generateSoundEffect(text, outputPath, duration = 20) {
  console.log(`Generating: "${text}" -> ${outputPath}`);

  const postData = JSON.stringify({
    text: text,
    duration_seconds: duration,
    prompt_influence: 0.5
  });

  const options = {
    hostname: 'api.elevenlabs.io',
    port: 443,
    path: '/v1/sound-generation',
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_LABS_API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errorBody = '';
        res.on('data', (chunk) => { errorBody += chunk; });
        res.on('end', () => {
          console.error(`Error generating sound: ${res.statusCode} - ${res.statusMessage}`, errorBody);
          reject(new Error(errorBody));
        });
        return;
      }

      const file = fs.createWriteStream(outputPath);
      res.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Successfully saved to ${outputPath}`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
    // 1. Quantum Foghorn Ambience
    await generateSoundEffect(
        "A low, haunting foghorn heard from a distance in a thick, mysterious fog. Gentle ocean waves lapping against a dock. atmospheric, ambient, mysterious, moody, low rumble, wet atmosphere, cinematic.",
        "public/sounds/foghorn_ambience.mp3",
        15
    );

    // 2. Eerie Noir Jazz Music
    await generateSoundEffect(
        "Slow, moody noir jazz saxophone and upright bass play a mysterious melody in a smoky room. Rain tapping on a window. Lo-fi, vintage, cozy mystery, Detective atmosphere.",
        "public/sounds/mystery_music.mp3",
        20
    );
}

main();
