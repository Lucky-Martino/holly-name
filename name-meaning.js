// Get DOM elements
const nameInput = document.getElementById('nameInput');
const searchBtn = document.getElementById('searchBtn');
const resultBox = document.getElementById('resultBox');
const copyBtn = document.getElementById('copyBtn');
const historySection = document.getElementById('historySection');
const nameHistory = document.getElementById('nameHistory');
const clearHistoryBtn = document.getElementById('clearHistory');
const downloadHistoryBtn = document.getElementById('downloadHistory');

// Share buttons
const shareWhatsapp = document.getElementById('shareWhatsapp');
const shareFacebook = document.getElementById('shareFacebook');
const shareTwitter = document.getElementById('shareTwitter');
const shareEmail = document.getElementById('shareEmail');

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
    
    // Get meaning from main database first
    const meaning = nameMeanings[formattedName];
    console.log('Main database result:', meaning);

    // If not found in main database, check CSV database
    const csvMeaning = !meaning && csvNames ? csvNames[formattedName] : null;
    console.log('CSV database result:', csvMeaning);

    // Show result box
    resultBox.style.display = 'block';
    
    // Get result elements
    const nameTitle = resultBox.querySelector('.name-title');
    const meaningText = resultBox.querySelector('.meaning');
    const descriptionText = resultBox.querySelector('.description');

    // Clear previous animations
    resultBox.classList.remove('animate__animated', 'animate__fadeIn');
    
    if (meaning || csvMeaning) {
        const result = meaning || csvMeaning;
        nameTitle.textContent = formattedName;
        meaningText.textContent = result.meaning;
        descriptionText.textContent = result.description || 'No detailed description available.';
        
        // Update current result for copy function
        currentResult = `Name: ${formattedName}\nMeaning: ${result.meaning}\nDescription: ${result.description || 'No detailed description available'}`;
        
        // Add to history
        updateHistory(formattedName, result.meaning, result.description);
        
        // If no description, add Google search link
        if (!result.description) {
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

// Share functions
function shareResult(platform) {
    const name = resultBox.querySelector('.name-title').textContent;
    const meaning = resultBox.querySelector('.meaning').textContent;
    const description = resultBox.querySelector('.description').textContent;
    const text = `Name: ${name}\nMeaning: ${meaning}\n${description}`;
    const encodedText = encodeURIComponent(text);
    
    let url = '';
    switch(platform) {
        case 'whatsapp':
            url = `https://wa.me/?text=${encodedText}`;
            break;
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedText}`;
            break;
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodedText}`;
            break;
        case 'email':
            url = `mailto:?subject=Name Meaning: ${name}&body=${encodedText}`;
            break;
    }
    
    // Open in new window
    window.open(url, '_blank');
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

// Share button event listeners
shareWhatsapp.addEventListener('click', () => shareResult('whatsapp'));
shareFacebook.addEventListener('click', () => shareResult('facebook'));
shareTwitter.addEventListener('click', () => shareResult('twitter'));
shareEmail.addEventListener('click', () => shareResult('email'));

// Display initial history
displayHistory();
