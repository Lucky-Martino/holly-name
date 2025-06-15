console.log('Loading name-database.js...');

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const nameList = document.getElementById('nameList');
    const genderFilter = document.getElementById('genderFilter');
    const totalNames = document.getElementById('totalNames');
    const letterButtons = document.querySelectorAll('.letter-filter button');

    // Current filter state
    let currentLetter = 'all';

// Function to display names
    function displayNames() {
        // Get all names from both databases
        let names = [];

        // Add names from primary database
        if (window.nameMeanings) {
            Object.entries(window.nameMeanings).forEach(([name, data]) => {
                names.push({
                    name,
                    meaning: data.meaning,
                    description: data.description,
                    gender: 'Unknown'
                });
            });
        }

        // Add names from CSV database
        if (window.csvNames) {
            Object.entries(window.csvNames).forEach(([name, data]) => {
                names.push({
                    name,
                    meaning: data.meaning,
                    description: data.description,
                    gender: data.gender,
                    fromCsv: true
                });
            });
        }

        // Apply filters
        const searchTerm = searchInput.value.toLowerCase();
        const gender = genderFilter.value;

        names = names.filter(nameData => {
            // Search filter
            if (searchTerm) {
                const matchesName = nameData.name.toLowerCase().includes(searchTerm);
                const matchesMeaning = nameData.meaning.toLowerCase().includes(searchTerm);
                if (!matchesName && !matchesMeaning) return false;
            }

            // Gender filter
            if (gender !== 'all' && nameData.gender.toLowerCase() !== gender.toLowerCase()) {
                return false;
            }

            return true;
        });

        // Sort alphabetically
        names.sort((a, b) => a.name.localeCompare(b.name));

        // Update total count
        totalNames.textContent = names.length;

        // Generate HTML
        let html = '';
        let currentLetterGroup = '';

        names.forEach(nameData => {
            const firstLetter = nameData.name[0].toUpperCase();
            
            // Create new letter section if needed
            if (firstLetter !== currentLetterGroup) {
                if (currentLetterGroup) {
                    html += '</div></div>';
                }
                currentLetterGroup = firstLetter;
                html += `
                    <div class="letter-section mb-4" id="letter-${firstLetter.toLowerCase()}">
                        <h2 class="letter-heading">${firstLetter}</h2>
                        <div class="row">
                `;
            }

            // Add name card
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="name-card">
                        <h3 class="name-title">${nameData.name}</h3>
                        <p class="meaning"><strong>Meaning:</strong> ${nameData.meaning}</p>
                        ${nameData.description ? `<p class="description">${nameData.description}</p>` : ''}
                        <div class="tags">
                            <span class="badge bg-secondary">${nameData.gender}</span>
                            ${nameData.fromCsv ? '<span class="badge bg-info">From Dataset</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        // Close the last letter section
        if (currentLetterGroup) {
            html += '</div></div>';
        }

        // Update the display
        nameList.innerHTML = html;

        // Scroll to letter if selected
        if (currentLetter !== 'all') {
            const section = document.getElementById(`letter-${currentLetter}`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
}

    // Set up event listeners
    searchInput.addEventListener('input', displayNames);
    genderFilter.addEventListener('change', displayNames);

    letterButtons.forEach(button => {
        button.addEventListener('click', () => {
            letterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentLetter = button.getAttribute('data-letter');
            displayNames();
        });
    });

    // Initial display
    displayNames();
});
