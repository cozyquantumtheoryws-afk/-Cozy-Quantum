const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = "/Volumes/external hard drive/Quantum Fiction/The_Waveform_Handyman/the_foghorn/The Foghorn's Dilemma (Full Novelette).pdf";

if (!fs.existsSync(pdfPath)) {
  console.error("File not found:", pdfPath);
  process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
  let cleanText = data.text;
  
  // Clean up
  cleanText = cleanText.replace(/\r\n/g, '\n');
  
  // Join hyphenated words
  cleanText = cleanText.replace(/(\w)-\n(\w)/g, '$1$2');
  
  // Split into sentences/lines for easier reading
  // Split by period+space or newline, but keep it roughly sentence/paragraph based.
  // For this novelette, paragraphs are best.
  let lines = cleanText.split(/\n\n+/); 
  
  // Clean each line
  lines = lines.map(l => l.replace(/\n/g, ' ').trim()).filter(l => l.length > 20);
  
  const tsContent = `export const FOGHORN_FULL_SCRIPT = ${JSON.stringify(lines, null, 2)};`;
  
  fs.writeFileSync('src/data/foghorn_script.ts', tsContent);
  console.log("Script saved to src/data/foghorn_script.ts. Line count:", lines.length);
}).catch(err => {
    console.error("PDF Parse Error", err);
});
