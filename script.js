let currentTab = 'practice';
let cardShown = false;
let currentFilter = 'all';

function showTab(tabName) {
// Hide all tabs
document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
});

// Remove active class from all tab buttons
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
});

// Show selected tab
document.getElementById(tabName).classList.add('active');

// Add active class to clicked button
event.target.classList.add('active');

currentTab = tabName;
}

function toggleCard() {
const translation = document.getElementById('cardTranslation');
const button = document.getElementById('showBtn');

if (!cardShown) {
    translation.style.display = 'block';
    button.textContent = 'Next Card';
    cardShown = true;
} else {
    // Here you would load the next card from the selected deck
    translation.style.display = 'none';
    button.textContent = 'Show';
    cardShown = false;
    // This is where you'd implement the logic to show the next card
}
}

function selectDeck(deckId) {
alert(`Selected deck: ${deckId}. This would load the deck for practice.`);
// Here you would implement deck loading logic
}

function filterDecks(category) {
currentFilter = category;

// Update filter button states
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
});
event.target.classList.add('active');

// Filter deck cards
const deckCards = document.querySelectorAll('#deckGrid .deck-card');

deckCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    
    if (category === 'all' || cardCategory.includes(category)) {
        card.style.display = 'block';
    } else {
        card.style.display = 'none';
    }
});
}

function searchDecks() {
const searchTerm = document.getElementById('searchInput').value.toLowerCase();
const deckCards = document.querySelectorAll('#deckGrid .deck-card');

deckCards.forEach(card => {
    const title = card.querySelector('.deck-title').textContent.toLowerCase();
    const description = card.querySelector('.deck-description').textContent.toLowerCase();
    const category = card.getAttribute('data-category');
    
    const matches = title.includes(searchTerm) || 
                    description.includes(searchTerm) || 
                    category.includes(searchTerm);
    
    const categoryMatches = currentFilter === 'all' || category.includes(currentFilter);
    
    if (matches && categoryMatches) {
        card.style.display = 'block';
    } else {
        card.style.display = 'none';
    }
});
}

function addCard() {
const container = document.getElementById('cardsContainer');
const cardItem = document.createElement('div');
cardItem.className = 'card-item';
cardItem.innerHTML = `
    <div class="card-inputs">
        <input type="text" class="card-input" placeholder="Front (Japanese)" name="cardFront">
        <input type="text" class="card-input" placeholder="Back (Translation)" name="cardBack">
        <button type="button" class="remove-card-btn" onclick="removeCard(this)">×</button>
    </div>
`;
container.appendChild(cardItem);
}

function removeCard(button) {
const cardItem = button.closest('.card-item');
const container = document.getElementById('cardsContainer');

// Don't remove if it's the last card
if (container.children.length > 1) {
    cardItem.remove();
} else {
    alert('You must have at least one card in your deck.');
}
}

function publishDeck() {
const title = document.getElementById('deckTitle').value;
const description = document.getElementById('deckDescription').value;
const category = document.getElementById('deckCategory').value;
const level = document.getElementById('deckLevel').value;

if (!title.trim() || !description.trim()) {
    alert('Please fill in all required fields.');
    return;
}

// Collect all cards
const cardItems = document.querySelectorAll('.card-item');
const cards = [];

cardItems.forEach(item => {
    const front = item.querySelector('input[name="cardFront"]').value.trim();
    const back = item.querySelector('input[name="cardBack"]').value.trim();
    
    if (front && back) {
        cards.push({ front, back });
    }
});

if (cards.length === 0) {
    alert('Please add at least one complete card (both front and back).');
    return;
}

// Here you would send the data to your backend
const deckData = {
    title,
    description,
    category,
    level,
    cards
};

console.log('Publishing deck:', deckData);
alert(`Deck "${title}" created successfully with ${cards.length} cards!`);

// Reset form
document.getElementById('createDeckForm').reset();
document.getElementById('cardsContainer').innerHTML = `
    <div class="card-item">
        <div class="card-inputs">
            <input type="text" class="card-input" placeholder="Front (Japanese)" name="cardFront">
            <input type="text" class="card-input" placeholder="Back (Translation)" name="cardBack">
            <button type="button" class="remove-card-btn" onclick="removeCard(this)">×</button>
        </div>
    </div>
`;
}