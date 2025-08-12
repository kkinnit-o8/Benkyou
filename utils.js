import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    onSnapshot,
    updateDoc 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5UE5lNlpdiLS1j2aHvxGEpvK12t1TTFs",
  authDomain: "benkyou-9ece6.firebaseapp.com",
  projectId: "benkyou-9ece6",
  storageBucket: "benkyou-9ece6.firebasestorage.app",
  messagingSenderId: "766017318941",
  appId: "1:766017318941:web:d7fd0ed52818fc8f14d6f4",
  measurementId: "G-MKVVFB9ZCY"
};

// 🔄 Initialiser Firebase og Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📥 Hent alle dokumenter fra valgt samling
async function hentDokumenter(samling) {
    try {
        const snapshot = await getDocs(collection(db, samling));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Feil ved henting:", error);
        return [];
    }
}

// ➕ Legg til nytt dokument i valgt samling
async function leggTilDokument(samling, data) {
    try {
        await addDoc(collection(db, samling), data);
        console.log("Dokument lagt til.");
    } catch (error) {
        console.error("Feil ved lagring:", error);
    }
}
// ❌ Slett dokument fra samling
async function slettDokument(samling, id) {
    try {
        await deleteDoc(doc(db, samling, id));
        console.log("Dokument slettet.");
    } catch (error) {
        console.error("Feil ved sletting:", error);
    }
}

// 🔁 Vis alle dokumenter og oppdater automatisk ved endringer
function visDokumenterLive(samling, visningsfunksjon) {
    onSnapshot(collection(db, samling), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        visningsfunksjon(data);
    });
}

async function oppdaterDokument(samling, id, data) {
    const docRef = doc(db, samling, id);
    await updateDoc(docRef, data);
  }
  

export {
    hentDokumenter,
    leggTilDokument,
    slettDokument,
    visDokumenterLive,
    oppdaterDokument
};
