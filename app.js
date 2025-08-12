import {
    hentDokumenter,
    leggTilDokument,
    slettDokument,
    visDokumenterLive,
    oppdaterDokument
} from "./utils.js"

let currentTab = 'practice';
let cardShown = false;
let currentFilter = 'all';
let currentDeck = null;
let currentCardIndex = 0;

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Load decks from database on page load
    await loadDecks();

    // Navigation tab buttons
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.textContent.toLowerCase().replace(' decks', '').replace(' deck', '');
            if (tabName === 'browse') {
                showTab('browse');
            } else if (tabName === 'create') {
                showTab('create');
            } else {
                showTab('practice');
            }
        });
    });

    // Main tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.textContent.toLowerCase().replace(' decks', '').replace(' deck', '');
            if (tabName === 'browse') {
                showTab('browse');
            } else if (tabName === 'create') {
                showTab('create');
            } else {
                showTab('practice');
            }
        });
    });

    // Show/Next card button
    const showBtn = document.getElementById('showBtn');
    if (showBtn) {
        showBtn.addEventListener('click', toggleCard);
    }

    // Add card button
    const addCardBtn = document.querySelector('.add-card-btn');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', addCard);
    }

    // Publish deck button
    const publishBtn = document.querySelector('.publish-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', publishDeck);
    }

    // Remove card buttons (for initial card)
    document.querySelectorAll('.remove-card-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            removeCard(this);
        });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.textContent.toLowerCase();
            filterDecks(category, this);
        });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchDecks);
    }
});

// Load decks from database
async function loadDecks() {
    try {
        const decks = await hentDokumenter("decks");
        console.log('Loaded decks:', decks);
        
        // Update practice tab decks
        updatePracticeDecks(decks);
        
        // Update browse tab decks
        updateBrowseDecks(decks);
        
        // Reattach event listeners for deck cards
        attachDeckEventListeners();
        
    } catch (error) {
        console.error('Error loading decks:', error);
        // Keep the static demo decks if database fails
    }
}

function updatePracticeDecks(decks) {
    const practiceGrid = document.querySelector('#practice .deck-grid');
    if (!practiceGrid) return;

    // Keep first 3 decks for practice tab (your saved decks)
    const practiceDecks = decks.slice(0, 3);
    
    if (practiceDecks.length > 0) {
        practiceGrid.innerHTML = practiceDecks.map(deck => `
            <div class="deck-card" data-deck-id="${deck.id}">
                <div class="deck-title">${deck.title}</div>
                <div class="deck-description">${deck.description}</div>
                <div class="deck-stats">
                    <span>${deck.cards ? deck.cards.length : 0} cards</span>
                    <span>⭐ ${deck.rating || 4.5}</span>
                </div>
            </div>
        `).join('');
    }
}

function updateBrowseDecks(decks) {
    const browseGrid = document.getElementById('deckGrid');
    if (!browseGrid) return;

    if (decks.length > 0) {
        browseGrid.innerHTML = decks.map(deck => `
            <div class="deck-card" data-category="${deck['data-category'] || deck.level + ' ' + deck.category}" data-deck-id="${deck.id}">
                <div class="deck-title">${deck.title}</div>
                <div class="deck-description">${deck.description}</div>
                <div class="deck-stats">
                    <span>${deck.cards ? deck.cards.length : 0} cards</span>
                    <span>⭐ ${deck.rating || 4.5}</span>
                </div>
            </div>
        `).join('');
    }
}

function attachDeckEventListeners() {
    // Deck selection cards (all deck cards)
    document.querySelectorAll('.deck-card').forEach(card => {
        card.addEventListener('click', function() {
            const deckId = this.getAttribute('data-deck-id');
            const deckTitle = this.querySelector('.deck-title').textContent;
            selectDeck(deckId, deckTitle);
        });
    });
}

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
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Add active class to corresponding button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.toLowerCase().replace(' decks', '').replace(' deck', '') === tabName) {
            btn.classList.add('active');
        }
    });

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
        // Load next card
        nextCard();
        translation.style.display = 'none';
        button.textContent = 'Show';
        cardShown = false;
    }
}

function loadCurrentCard() {
    if (!currentDeck || !currentDeck.cards || currentDeck.cards.length === 0) {
        return;
    }

    const card = currentDeck.cards[currentCardIndex];
    const cardContent = document.getElementById('cardContent');
    const cardTranslation = document.getElementById('cardTranslation');
    const showBtn = document.getElementById('showBtn');

    if (cardContent && cardTranslation) {
        cardContent.textContent = card.front;
        cardTranslation.textContent = card.back;
        cardTranslation.style.display = 'none';
        showBtn.textContent = 'Show';
        cardShown = false;
    }
}

function nextCard() {
    if (!currentDeck || !currentDeck.cards) {
        return;
    }

    currentCardIndex = (currentCardIndex + 1) % currentDeck.cards.length;
    loadCurrentCard();
}

async function selectDeck(deckId, deckTitle) {
    try {
        // Get all decks and find the selected one
        const decks = await hentDokumenter("decks");
        const selectedDeck = decks.find(deck => deck.id === deckId);
        
        if (selectedDeck && selectedDeck.cards) {
            console.log('Selected deck:', selectedDeck);
            
            // Load the deck for practice
            currentDeck = selectedDeck;
            currentCardIndex = 0;
            
            // Show first card
            loadCurrentCard();
            
            // Switch to practice tab if not already there
            if (currentTab !== 'practice') {
                showTab('practice');
            }
            
            alert(`Loaded deck: ${deckTitle} with ${selectedDeck.cards.length} cards`);
        } else {
            alert(`Deck "${deckTitle}" not found or has no cards.`);
        }
    } catch (error) {
        console.error('Error selecting deck:', error);
        alert('Failed to load deck. Please try again.');
    }
}

function filterDecks(category, buttonElement = null) {
    currentFilter = category;

    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (buttonElement) {
        buttonElement.classList.add('active');
    }

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
            <button type="button" class="remove-card-btn">×</button>
        </div>
    `;
    
    // Add event listener to the new remove button
    const removeBtn = cardItem.querySelector('.remove-card-btn');
    removeBtn.addEventListener('click', function() {
        removeCard(this);
    });
    
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

async function publishDeck() {
    const title = document.getElementById('deckTitle').value;
    const description = document.getElementById('deckDescription').value;
    const category = document.getElementById('deckCategory').value;

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

    // Create deck data object
    const deckData = {
        title,
        description,
        category,
        cards,
        rating: 0,
        createdAt: new Date().toISOString(),
    };

    try {
        // Upload deck to database
        await leggTilDokument("decks", deckData);
        console.log('Deck published successfully:', deckData);
        alert(`Deck "${title}" created successfully with ${cards.length} cards!`);

        // Reset form
        document.getElementById('createDeckForm').reset();
        resetCardContainer();

        // Refresh deck listings
        await loadDecks();
        
    } catch (error) {
        console.error('Error publishing deck:', error);
        alert('Failed to publish deck. Please try again.');
    }
}

function resetCardContainer() {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = `
        <div class="card-item">
            <div class="card-inputs">
                <input type="text" class="card-input" placeholder="Front (Japanese)" name="cardFront">
                <input type="text" class="card-input" placeholder="Back (Translation)" name="cardBack">
                <button type="button" class="remove-card-btn">×</button>
            </div>
        </div>
    `;
    
    // Re-add event listener to the reset remove button
    const removeBtn = container.querySelector('.remove-card-btn');
    removeBtn.addEventListener('click', function() {
        removeCard(this);
    });
}