const fs = require('fs');

// Read the CSV file
const csvData = fs.readFileSync('dataset.csv', 'utf8');

// Parse CSV into array of objects
const lines = csvData.split('\n');
const headers = lines[0].split(',');
const data = {};

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    const name = values[0];
    const gender = values[1];
    const meaning = values[2];
    
    if (name && gender && meaning) {
        data[name] = {
            meaning: meaning,
            gender: gender,
            description: `Gender: ${gender}`
        };
    }
}

// Generate JavaScript code
const jsCode = `// CSV name database
window.csvNames = ${JSON.stringify(data, null, 4)};
`;

// Write to file
fs.writeFileSync('csv-names.js', jsCode);
console.log('Conversion complete!');
