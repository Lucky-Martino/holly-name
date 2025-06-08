const questions = [
    {
        question: "What Christian virtue do you value most?",
        options: [
            { text: "Faith - Unwavering belief in God", value: "faith" },
            { text: "Hope - Trust in God's promises", value: "hope" },
            { text: "Love - Unconditional care for others", value: "love" },
            { text: "Wisdom - Understanding God's will", value: "wisdom" }
        ]
    },
    {
        question: "Which biblical story inspires you the most?",
        options: [
            { text: "David's victory over Goliath - Courage and trust in God", value: "courage" },
            { text: "Solomon's wisdom - Knowledge and discernment", value: "wisdom" },
            { text: "Ruth's loyalty - Dedication and faithfulness", value: "loyalty" },
            { text: "Joseph's forgiveness - Grace and mercy", value: "mercy" }
        ]
    },
    {
        question: "What role do you see yourself playing in your faith community?",
        options: [
            { text: "Teacher - Sharing knowledge and wisdom", value: "teacher" },
            { text: "Helper - Supporting and serving others", value: "helper" },
            { text: "Leader - Guiding and inspiring others", value: "leader" },
            { text: "Peacemaker - Bringing harmony and reconciliation", value: "peace" }
        ]
    },
    {
        question: "Which aspect of God's character resonates with you most?",
        options: [
            { text: "God's love and compassion", value: "love" },
            { text: "God's wisdom and justice", value: "justice" },
            { text: "God's power and majesty", value: "power" },
            { text: "God's mercy and forgiveness", value: "mercy" }
        ]
    },
    {
        question: "What kind of legacy would you like to leave?",
        options: [
            { text: "A legacy of faith and devotion", value: "faith" },
            { text: "A legacy of service and kindness", value: "service" },
            { text: "A legacy of wisdom and guidance", value: "wisdom" },
            { text: "A legacy of love and family", value: "family" }
        ]
    }
];

const nameTraits = {
    faith: ["John", "Peter", "Faith", "Grace"],
    hope: ["Hope", "Christian", "Joy", "Gabriel"],
    love: ["Charity", "Caritas", "David", "Mary"],
    wisdom: ["Solomon", "Daniel", "Sophia", "Prudence"],
    courage: ["Joshua", "Caleb", "Deborah", "Judith"],
    loyalty: ["Ruth", "Jonathan", "Naomi", "Hannah"],
    mercy: ["Joseph", "Michael", "Mercy", "Rachel"],
    teacher: ["Paul", "Timothy", "Sarah", "Priscilla"],
    helper: ["Martha", "Stephen", "Phoebe", "Mark"],
    leader: ["Moses", "Esther", "Samuel", "Miriam"],
    peace: ["Solomon", "Aaron", "Shalom", "Irene"],
    justice: ["Daniel", "Deborah", "Justin", "Elizabeth"],
    power: ["Samson", "David", "Victoria", "Alexander"],
    service: ["Martha", "Dorcas", "Stephen", "Timothy"],
    family: ["Joseph", "Ruth", "Sarah", "Abraham"]
};

let currentQuestion = 0;
let answers = [];

// Sound effects
const sounds = {
    click: new Audio('click.mp3'),
    success: new Audio('success.mp3'),
    complete: new Audio('complete.mp3'),
    hover: new Audio('hover.mp3')
};

// Preload sounds
Object.values(sounds).forEach(sound => {
    sound.load();
    sound.volume = 0.3;
});

document.addEventListener('DOMContentLoaded', () => {
    const nextBtn = document.getElementById('nextBtn');
    const quizContainer = document.getElementById('quizContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    const questionContainer = document.getElementById('questionContainer');
    const progressBar = document.querySelector('.progress-bar');
    const retakeBtn = document.getElementById('retakeBtn');

    nextBtn.addEventListener('click', handleNext);
    retakeBtn.addEventListener('click', restartQuiz);

    showQuestion();
});

function showQuestion() {
    if (currentQuestion >= questions.length) {
        showResults();
        return;
    }

    const question = questions[currentQuestion];
    const questionContainer = document.getElementById('questionContainer');
    const progressBar = document.querySelector('.progress-bar');
    const nextBtn = document.getElementById('nextBtn');

    // Update progress bar
    const progress = ((currentQuestion) / questions.length) * 100;
    progressBar.style.width = progress + '%';

    // Update button text
    nextBtn.textContent = currentQuestion === questions.length - 1 ? 'Show Results' : 'Next Question';
    nextBtn.disabled = true;

    // Create question HTML
    const questionHTML = `
        <div class="question mb-4">${question.question}</div>
        <div class="options">
            ${question.options.map((option, index) => `
                <button class="option-btn" data-value="${option.value}">
                    ${option.text}
                </button>
            `).join('')}
        </div>
    `;

    questionContainer.innerHTML = questionHTML;

    // Add click handlers to options
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        // Add hover sound effect
        btn.addEventListener('mouseenter', () => {
            sounds.hover.currentTime = 0;
            sounds.hover.play();
        });

        btn.addEventListener('click', () => {
            sounds.click.currentTime = 0;
            sounds.click.play();
            optionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            nextBtn.disabled = false;
        });
    });
}

function handleNext() {
    const selectedOption = document.querySelector('.option-btn.selected');
    if (!selectedOption && currentQuestion < questions.length) return;

    if (currentQuestion < questions.length) {
        answers.push(selectedOption.dataset.value);
        currentQuestion++;
        showQuestion();
    }
}

let quizResults = '';

function showResults() {
    const quizContainer = document.getElementById('quizContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultNames = document.querySelector('.result-names');
    const nameMeanings = document.querySelector('.name-meanings');
    const explanation = document.querySelector('.result-explanation');

    // Hide quiz, show results with sound
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    sounds.complete.play();

    // Analyze answers and get matching names
    const traits = analyzeAnswers(answers);
    const matchingNames = getMatchingNames(traits);

    // Display results
    resultNames.innerHTML = matchingNames.map(name => `<span class="badge bg-light text-dark p-2 m-1">${name}</span>`).join('');
    
    // Display name meanings
    const meaningsHTML = matchingNames.map(name => {
        const meaning = nameMeanings[name] || { meaning: "A blessed name", description: "A name chosen for its spiritual significance." };
        return `
            <div class="name-meaning mb-3">
                <strong>${name}:</strong> ${meaning.meaning}
                ${meaning.description ? `<br><small>${meaning.description}</small>` : ''}
            </div>
        `;
    }).join('');
    nameMeanings.innerHTML = meaningsHTML;

    // Add explanation
    const explanationText = `These names reflect your values of ${traits.slice(0, 3).join(', ')}, making them perfect choices for someone who embodies these Christian virtues.`;
    explanation.innerHTML = `<p>${explanationText}</p>`;

    // Prepare results text for copying/downloading
    quizResults = `Your Christian Name Quiz Results\n\n`;
    quizResults += `Selected Names:\n${matchingNames.join(', ')}\n\n`;
    quizResults += `Name Meanings:\n`;
    matchingNames.forEach(name => {
        const meaning = nameMeanings[name] || { meaning: "A blessed name", description: "A name chosen for its spiritual significance." };
        quizResults += `${name}: ${meaning.meaning}\n`;
        if (meaning.description) quizResults += `${meaning.description}\n`;
    });
    quizResults += `\n${explanationText}\n\nTaken on: ${new Date().toLocaleDateString()}`;
}

function analyzeAnswers(answers) {
    // Count frequency of each trait
    const traitCount = answers.reduce((acc, trait) => {
        acc[trait] = (acc[trait] || 0) + 1;
        return acc;
    }, {});

    // Sort traits by frequency
    return Object.entries(traitCount)
        .sort((a, b) => b[1] - a[1])
        .map(([trait]) => trait);
}

function getMatchingNames(traits) {
    const names = new Set();
    
    // Get names for top 3 traits
    for (let i = 0; i < Math.min(3, traits.length); i++) {
        const traitNames = nameTraits[traits[i]] || [];
        traitNames.forEach(name => names.add(name));
    }

    // Convert to array and get random 3-5 names
    const nameArray = Array.from(names);
    const numNames = Math.floor(Math.random() * 3) + 3; // 3-5 names
    return shuffleArray(nameArray).slice(0, numNames);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function restartQuiz() {
    currentQuestion = 0;
    answers = [];
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('resultsContainer').style.display = 'none';
    showQuestion();
}

// Social sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('I just discovered my perfect Christian names! Try the quiz:');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('I just discovered my perfect Christian names! Try the quiz:');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('I just discovered my perfect Christian names! Try the quiz:');
    window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
}

async function copyResults() {
    try {
        await navigator.clipboard.writeText(quizResults);
        const toast = new bootstrap.Toast(document.getElementById('copyToast'));
        toast.show();
    } catch (err) {
        console.error('Failed to copy results:', err);
        alert('Failed to copy results. Please try again.');
    }
}

function downloadResults() {
    try {
        const blob = new Blob([quizResults], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0,10);
        a.href = url;
        a.download = `christian-name-quiz-${timestamp}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to download results:', err);
        alert('Failed to download results. Please try again.');
    }
}
