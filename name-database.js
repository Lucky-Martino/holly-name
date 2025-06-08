// Get DOM elements
const genderFilter = document.getElementById('genderFilter');
const searchInput = document.getElementById('searchInput');
const nameList = document.getElementById('nameList');

// Function to display names
function displayNames(filter = 'all', search = '') {
    let names = Object.entries(nameMeanings);
    
    // Filter by gender if specified
    if (filter !== 'all') {
        names = names.filter(([name, data]) => {
            const firstLetter = name.charAt(0).toLowerCase();
            return (filter === 'male' && firstLetter === 'm') || 
                   (filter === 'female' && firstLetter === 'f');
        });
    }

    // Filter by search term
    if (search) {
        const searchLower = search.toLowerCase();
        names = names.filter(([name, data]) => 
            name.toLowerCase().includes(searchLower) || 
            data.meaning.toLowerCase().includes(searchLower) ||
            (data.description && data.description.toLowerCase().includes(searchLower))
        );
    }

    // Sort alphabetically
    names.sort((a, b) => a[0].localeCompare(b[0]));

    // Generate HTML
    nameList.innerHTML = names.map(([name, data]) => `
        <div class="name-item animate__animated animate__fadeIn">
            <div class="gender ${name.charAt(0).toLowerCase() === 'm' ? 'male' : 'female'}">
                ${name.charAt(0).toLowerCase() === 'm' ? 'Male' : 'Female'}
            </div>
            <div class="name">${name}</div>
            <div class="meaning">${data.meaning}</div>
            ${data.description ? `<div class="description">${data.description}</div>` : ''}
        </div>
    `).join('');
}

// Event listeners
genderFilter.addEventListener('change', () => {
    displayNames(genderFilter.value, searchInput.value);
});

searchInput.addEventListener('input', () => {
    displayNames(genderFilter.value, searchInput.value);
});

// Initial display
displayNames();
