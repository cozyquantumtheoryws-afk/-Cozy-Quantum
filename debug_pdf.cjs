const pdfLib = require('pdf-parse');
console.log('Type of export:', typeof pdfLib);
console.log('Keys:', Object.keys(pdfLib));
if (typeof pdfLib === 'object' && pdfLib.default) {
    console.log('Default export type:', typeof pdfLib.default);
}
