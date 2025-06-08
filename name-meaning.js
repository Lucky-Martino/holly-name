// Get DOM elements
const nameInput = document.getElementById('nameInput');
const searchBtn = document.getElementById('searchBtn');
const resultBox = document.getElementById('resultBox');
const copyBtn = document.getElementById('copyBtn');
const historySection = document.getElementById('historySection');
const nameHistory = document.getElementById('nameHistory');
const clearHistoryBtn = document.getElementById('clearHistory');
const downloadHistoryBtn = document.getElementById('downloadHistory');

// Initialize history from localStorage
let history = JSON.parse(localStorage.getItem('nameMeaningHistory') || '[]');

// Current result for copying
let currentResult = '';

// Sound effects
const searchSound = new Audio('https://github.com/lucky-martino/Holly-Game/raw/main/sounds/generate.mp3');
const copySound = new Audio('https://github.com/lucky-martino/Holly-Game/raw/main/sounds/copy.mp3');

// History functions
function updateHistory(name, meaning, description) {
    const timestamp = new Date().toLocaleString();
    const searchResult = {
        timestamp,
        name,
        meaning: meaning || 'Unknown',
        description: description || 'No description available'
    };

    history.unshift(searchResult);
    if (history.length > 10) history.pop(); // Keep only last 10 searches
    localStorage.setItem('nameMeaningHistory', JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    if (history.length === 0) {
        historySection.style.display = 'none';
        return;
    }

    historySection.style.display = 'block';
    nameHistory.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="timestamp">${item.timestamp}</div>
            <div class="name">${item.name}</div>
            <div class="meaning">${item.meaning}</div>
        </div>
    `).join('');
}

function clearHistory() {
    history = [];
    localStorage.setItem('nameMeaningHistory', '[]');
    displayHistory();
}

function downloadHistory() {
    const content = history.map(item => 
        `Name: ${item.name}\nMeaning: ${item.meaning}\nDescription: ${item.description}\nSearched on: ${item.timestamp}\n\n`
    ).join('---\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'name-meaning-history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Copy function
async function copyResult() {
    try {
        await navigator.clipboard.writeText(currentResult);
        playSound(copySound);
        
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
        copyBtn.classList.add('animate__animated', 'animate__pulse');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('animate__animated', 'animate__pulse');
        }, 2000);
    } catch (err) {
        alert('Failed to copy result. Please try again.');
    }
}

// Function to play sound with volume control
function playSound(sound) {
    sound.volume = 0.3;
    sound.play().catch(err => console.log('Sound play prevented:', err));
}

// Function to search for name meaning
function searchName() {
    const name = nameInput.value.trim();
    if (!name) return;

    // Play search sound
    playSound(searchSound);

    // Convert first letter to uppercase and rest to lowercase
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    
    // Get meaning from database
    const meaning = nameMeanings[formattedName];

    // Show result box
    resultBox.style.display = 'block';
    
    // Get result elements
    const nameTitle = resultBox.querySelector('.name-title');
    const meaningText = resultBox.querySelector('.meaning');
    const descriptionText = resultBox.querySelector('.description');

    // Clear previous animations
    resultBox.classList.remove('animate__animated', 'animate__fadeIn');
    
    if (meaning) {
        nameTitle.textContent = formattedName;
        meaningText.textContent = meaning.meaning;
        descriptionText.textContent = meaning.description || 'No detailed description available.';
        
        // Update current result for copy function
        currentResult = `Name: ${formattedName}\nMeaning: ${meaning.meaning}\nDescription: ${meaning.description || 'No detailed description available'}`;
        
        // Add to history
        updateHistory(formattedName, meaning.meaning, meaning.description);
        
        // If no description, add Google search link
        if (!meaning.description) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(formattedName + ' name meaning christian biblical')}`;
            descriptionText.innerHTML = `
                Description not available. 
                <a href="${searchUrl}" target="_blank" class="search-link">
                    <i class="bi bi-search"></i> Search on Google
                </a>`;
        }
    } else {
        nameTitle.textContent = formattedName;
        meaningText.textContent = 'Meaning not found';
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(formattedName + ' name meaning christian biblical')}`;
        descriptionText.innerHTML = `
            <a href="${searchUrl}" target="_blank" class="search-link">
                <i class="bi bi-search"></i> Search on Google
            </a>`;
    }

    // Add animation
    void resultBox.offsetWidth; // Trigger reflow
    resultBox.classList.add('animate__animated', 'animate__fadeIn');
}

// Event listeners
searchBtn.addEventListener('click', searchName);
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchName();
    }
});
copyBtn.addEventListener('click', copyResult);
clearHistoryBtn.addEventListener('click', clearHistory);
downloadHistoryBtn.addEventListener('click', downloadHistory);

// Display initial history
displayHistory();
