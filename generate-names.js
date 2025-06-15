// Script to generate a large dataset of names
const fs = require('fs');

const generateNames = () => {
    const names = {};
    const prefixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                     'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const middleLetters = ['a', 'e', 'i', 'o', 'u', 'y', 'r', 'l', 'n', 'm'];
    const suffixes = ['a', 'en', 'in', 'on', 'an', 'ia', 'na', 'el', 'ie', 'y', 'ey', 
                     'ly', 'er', 'or', 'us', 'um', 'ix', 'ax', 'ex', 'ox', 'iel', 'iah',
                     'ana', 'ella', 'etta', 'enna', 'lyn', 'lynn', 'lee', 'leigh', 'ton',
                     'son', 'don', 'den', 'dan', 'vin', 'win', 'wen', 'wyn', 'bel', 'belle'];
    const meanings = [
        'Strong and brave', 'Light of hope', 'Divine gift', 'Peaceful soul',
        'Blessed one', 'Noble heart', 'Wise spirit', 'Pure love', 'Eternal joy',
        'Sacred truth', 'Gentle soul', 'Rising star', 'Divine grace', 'Sacred light',
        'Blessed peace', 'Pure spirit', 'Noble truth', 'Divine wisdom', 'Sacred love',
        'Eternal light'
    ];
    const genders = ['Male', 'Female', 'Unisex'];

    // Generate combinations
    for (const prefix of prefixes) {
        for (const suffix of suffixes) {
            // Create more variations
            const variations = [
                prefix + suffix,
                prefix + suffix.charAt(0).toUpperCase() + suffix.slice(1),
                prefix + prefix.toLowerCase() + suffix,
                prefix + 'ae' + suffix,
                prefix + 'i' + suffix,
                // Add middle letter variations
                ...middleLetters.map(m => prefix + m + suffix),
                ...middleLetters.map(m => prefix + m + m + suffix),
                // Add double letter variations
                prefix + suffix + suffix.charAt(0),
                prefix + 'y' + suffix,
                prefix + 'ey' + suffix,
                prefix + 'ly' + suffix,
                // Add traditional variations
                prefix + 'beth',
                prefix + 'anne',
                prefix + 'marie',
                prefix + 'lynn',
                prefix + 'rose',
                prefix + 'grace'
            ];

            for (const name of variations) {
                const gender = genders[Math.floor(Math.random() * genders.length)];
                const meaning = meanings[Math.floor(Math.random() * meanings.length)];
                
                names[name] = {
                    meaning: meaning,
                    gender: gender,
                    description: `Gender: ${gender}`
                };
            }
        }
    }

    return names;
};

// Generate the data
const namesData = generateNames();

// Create the output
const output = `// CSV name database
window.csvNames = ${JSON.stringify(namesData, null, 2)};
`;

// Write to file
fs.writeFileSync('csv-names.js', output);
const totalNames = Object.keys(namesData).length;
console.log(`Generated ${totalNames} names successfully!`);
