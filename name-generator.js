const maleNames = [
    "Matthew", "John", "Peter", "Paul", "James", "Andrew", "Thomas", "Philip",
    "Bartholomew", "Simon", "Thaddeus", "Timothy", "Mark", "Luke", "Stephen",
    "David", "Solomon", "Daniel", "Joseph", "Benjamin", "Samuel", "Noah",
    "Abraham", "Isaac", "Jacob", "Moses", "Aaron", "Joshua", "Caleb", "Elijah"
];

const femaleNames = [
    "Mary", "Elizabeth", "Sarah", "Ruth", "Rebecca", "Rachel", "Leah", "Hannah",
    "Esther", "Deborah", "Miriam", "Martha", "Eve", "Naomi", "Anna", "Abigail",
    "Priscilla", "Lydia", "Phoebe", "Dorcas", "Tabitha", "Julia", "Chloe",
    "Faith", "Hope", "Grace", "Joy", "Charity", "Peace", "Mercy"
];

const generateBtn = document.getElementById('generateBtn');
const generatedNamesDiv = document.getElementById('generatedNames');
const nameHistoryDiv = document.getElementById('nameHistory');
const nameCountSelect = document.getElementById('nameCount');
const combinationCountSelect = document.getElementById('combinationCount');
const clearHistoryBtn = document.getElementById('clearHistory');
const downloadHistoryBtn = document.getElementById('downloadHistory');
const copyResultsBtn = document.getElementById('copyResults');

// Store the latest results for copying
let latestResults = '';

// Sound effects
const generateSound = new Audio('https://github.com/lucky-martino/Holly-Game/raw/main/sounds/generate.mp3');
const copySound = new Audio('https://github.com/lucky-martino/Holly-Game/raw/main/sounds/copy.mp3');

// Preload sounds
generateSound.load();
copySound.load();

// Function to play sound with volume control
function playSound(sound) {
    sound.volume = 0.3; // 30% volume
    sound.play().catch(err => console.log('Sound play prevented:', err));
}

// Load history from localStorage or initialize empty array
let history = JSON.parse(localStorage.getItem('nameHistory') || '[]');

function getRandomName(namesList, usedNames = []) {
    const availableNames = namesList.filter(name => !usedNames.includes(name));
    const randomIndex = Math.floor(Math.random() * availableNames.length);
    return availableNames[randomIndex];
}

function generateNameCombination(gender, nameCount) {
    const namesList = gender === 'male' ? maleNames : femaleNames;
    const combination = [];
    const usedNames = [];
    
    for (let i = 0; i < nameCount; i++) {
        const name = getRandomName(namesList, usedNames);
        combination.push(name);
        usedNames.push(name);
    }
    
    return combination;
}

function getRandomNames(gender, nameCount, combinationCount) {
    const combinations = [];
    const allUsedNames = new Set();
    
    for (let i = 0; i < combinationCount; i++) {
        const combination = generateNameCombination(gender, nameCount);
        combinations.push(combination);
        combination.forEach(name => allUsedNames.add(name));
        
        // If we've used all available names, break the loop
        if (allUsedNames.size >= (gender === 'male' ? maleNames.length : femaleNames.length)) {
            break;
        }
    }
    
    return combinations;
}

function updateHistory(names) {
    history.unshift({
        names: names,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
    });
    
    if (history.length > 5) {
        history.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('nameHistory', JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    nameHistoryDiv.innerHTML = history
        .map(item => `
            <div class="history-item">
                <span class="time">${item.timestamp}</span>:
                ${Array.isArray(item.names[0]) 
                    ? item.names.map((combination, i) => 
                        `<div class="combination">Combination ${i + 1}: ${combination.join(' ')}</div>`
                      ).join('')
                    : item.names.join(' ')}
            </div>
        `)
        .join('');
}

// Clear history function
function clearHistory() {
    if (confirm('Are you sure you want to clear the history?')) {
        history = [];
        localStorage.removeItem('nameHistory');
        displayHistory();
    }
}

// Download history function
function downloadHistory() {
    const historyText = history.map(item => {
        const namesText = Array.isArray(item.names[0])
            ? item.names.map((combination, i) => 
                `Combination ${i + 1}: ${combination.join(' ')}`
              ).join('\n')
            : item.names.join(' ');
        return `${item.date} ${item.timestamp}:\n${namesText}\n`;
    }).join('\n');

    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'name-generator-history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Event listeners
// Input validation
function validateInputs() {
    const nameCount = parseInt(nameCountSelect.value);
    const combinationCount = parseInt(combinationCountSelect.value);
    
    // Ensure values are within bounds
    nameCountSelect.value = Math.min(Math.max(nameCount, 1), 5);
    combinationCountSelect.value = Math.min(Math.max(combinationCount, 1), 20);
}

// Add input event listeners for validation
nameCountSelect.addEventListener('input', validateInputs);
combinationCountSelect.addEventListener('input', validateInputs);

generateBtn.addEventListener('click', () => {
    validateInputs();
    
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const nameCount = parseInt(nameCountSelect.value);
    const combinationCount = parseInt(combinationCountSelect.value);
    
    // Check if we have enough names in the list
    const namesList = gender === 'male' ? maleNames : femaleNames;
    if (nameCount > namesList.length) {
        alert(`Not enough ${gender} names available. Maximum is ${namesList.length} names.`);
        return;
    }
    
    const combinations = getRandomNames(gender, nameCount, combinationCount);
    
    // Build the display HTML and copy text simultaneously
    let displayHtml = '';
    latestResults = '';
    
    combinations.forEach((combination, i) => {
        // Add combination header to both HTML and copy text
        displayHtml += `<div class="combination-result mb-4">
            <div class="combination-number text-muted">Combination ${i + 1}:</div>`;
        latestResults += `Combination ${i + 1}:\n`;

        // Add names with their meanings
        displayHtml += `<div class="names mb-3">
            ${combination.map(name => `<span class="name">${name}</span>`).join(' ')}
        </div>`;
        
        // Add name meanings
        displayHtml += `<div class="meanings">`;
        combination.forEach(name => {
            const meaning = nameMeanings[name] || { meaning: 'Unknown', description: null };
            let descriptionHtml = '';
            
            if (meaning.description) {
                descriptionHtml = `<div class="description small text-muted">${meaning.description}</div>`;
            } else {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(name + ' name meaning christian biblical')}`;
                descriptionHtml = `
                    <div class="description small text-muted">
                        Description not available. 
                        <a href="${searchUrl}" target="_blank" class="search-link">
                            <i class="bi bi-search"></i> Search on Google
                        </a>
                    </div>`;
            }
            
            displayHtml += `
                <div class="name-meaning mb-2">
                    <div class="fw-bold">${name}:</div>
                    <div class="meaning text-primary">${meaning.meaning}</div>
                    ${descriptionHtml}
                </div>`;
            
            // Add to copy text
            latestResults += `${name} - ${meaning.meaning}\n`;
            if (meaning.description) {
                latestResults += `${meaning.description}\n`;
            } else {
                latestResults += `Search for meaning: https://www.google.com/search?q=${encodeURIComponent(name + ' name meaning christian biblical')}\n`;
            }
        });
        displayHtml += '</div></div>';
        latestResults += '\n';
    });
    
    generatedNamesDiv.innerHTML = displayHtml;
    copyResultsBtn.style.display = 'inline-block';
    
    // Play generate sound
    playSound(generateSound);
    
    // Add entrance animations to each result
    document.querySelectorAll('.combination-result').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.2}s`;
    });
    
    updateHistory(combinations);
});

// Copy results functionality
async function copyResults() {
    try {
        await navigator.clipboard.writeText(latestResults);
        const originalText = copyResultsBtn.innerHTML;
        copyResultsBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
        
        // Play copy sound
        playSound(copySound);
        
        // Add animation class
        copyResultsBtn.classList.add('animate__animated', 'animate__pulse');
        
        setTimeout(() => {
            copyResultsBtn.innerHTML = originalText;
            copyResultsBtn.classList.remove('animate__animated', 'animate__pulse');
        }, 2000);
    } catch (err) {
        alert('Failed to copy results. Please try again.');
    }
}

clearHistoryBtn.addEventListener('click', clearHistory);
downloadHistoryBtn.addEventListener('click', downloadHistory);
copyResultsBtn.addEventListener('click', copyResults);

// Display initial history
displayHistory();
