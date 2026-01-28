import fs from 'fs';
import pdfParse from 'pdf-parse';

const pdfPath = "/Volumes/external hard drive/Quantum Fiction/The_Waveform_Handyman/the_foghorn/The Foghorn's Dilemma (Full Novelette).pdf";

if (!fs.existsSync(pdfPath)) {
  console.error("File not found:", pdfPath);
  process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

pdfParse(dataBuffer).then(function(data) {
  // Simple cleaning: split by double newlines or periods to get roughly paragraph-sized chunks
  const text = data.text;
  
  // Clean up excessive whitespace
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n\n');
  
  // Split by newlines, filter empty, and limit to reasonable length for demo if huge
  const lines = cleanText.split('\n').filter(line => line.trim().length > 0);
  
  const tsContent = `export const FOGHORN_FULL_SCRIPT = ${JSON.stringify(lines, null, 2)};`;
  
  fs.writeFileSync('src/data/foghorn_script.ts', tsContent);
  console.log("Script saved to src/data/foghorn_script.ts");
}).catch(err => {
    console.error("PDF Parse Error", err);
});
