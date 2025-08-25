import {
    hentDokumenter,
    leggTilDokument,
    slettDokument,
    visDokumenterLive,
    oppdaterDokument
} from "./utils.js"


function load_decks(){
    hentDokumenter("decks").then(decks => {
        const deckList = document.getElementById("decks");
        deckList.innerHTML = ""; // Tøm listen før vi legger til nye elementer
        decks.forEach(deck => {
            let deck_div = document.createElement("div");
            deck_div.className = "deck-item";
            deck_div.innerHTML = `
                <h3 class="title">${deck.title}</h3>
                <p class="description">${deck.description}</p>
                <div>
                    <p>categorie: ${deck.categorie}</p>
                    <p>cards: ${deck.cards.length}</p>
                </div>
                <div>
                    <button class="start">Start</button>
                    <button class="edit">Edit</button>
                    <button class="delete">Delete</button>
                </div>  
                </div>`
            deckList.appendChild(deck_div);

            deck_div.querySelector(".start").addEventListener("click", () => {
                console.log("started " + deck.title);})
            deck_div.querySelector(".edit").addEventListener("click", () => {
                console.log("edit " + deck.title);
                // Her kan du legge til funksjonalitet for å redigere dekket
            });
            deck_div.querySelector(".delete").addEventListener("click", () => {
                slettDokument("decks", deck.id).then(() => {
                    console.log("Slettet " + deck.title);
                    load_decks();
                });
            }); 
        });
    });
}

function addDeck() {
    let deck_window = document.getElementById("deck_window");
    deck_window.style.display = "flex";
}

function addcard(){
    let card = document.createElement("div");
    let front = document.getElementById("card_front").value;
    let back = document.getElementById("card_back").value;
    card.className = "card-item";
    card.innerHTML = `
        <div class="card-front">${front}</div>
        <div class="card-back">${back}</div>
        <button class="delete-card">Delete</button>`;

    let cardList = document.getElementById("cards");
    cardList.appendChild(card);
}

function publishDeck(){
    let title = document.getElementById("deck_title").value;
    let description = document.getElementById("deck_description").value;
    let categorie = document.getElementById("deck_category").value;
    let cards = document.querySelectorAll(".card-item");

    let cardData = [];
    cards.forEach(card => {
        let frontElem = card.querySelector(".card-front");
        let backElem = card.querySelector(".card-back");
        if (frontElem && backElem) {
            let front = frontElem.textContent;
            let back = backElem.textContent;
            cardData.push({ front, back });
        }
    });


    let deckdata = {
        title: title,
        description: description,
        categorie: categorie,
        cards: cardData
    };

    leggTilDokument("decks", deckdata).then(() => {
        console.log("Deck added successfully");
        document.getElementById("deck_window").style.display = "none";
        load_decks();
    }
)}



let addcardButton = document.getElementById("add_card");
addcardButton.addEventListener("click", addcard);

let publishButton = document.getElementById("publish_deck");
publishButton.addEventListener("click", publishDeck);

let adddeckButton = document.getElementById("add_deck");
adddeckButton.addEventListener("click", addDeck);

load_decks();