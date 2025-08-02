// firebaseUtils.js

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC5UE5lNlpdiLS1j2aHvxGEpvK12t1TTFs",
  authDomain: "benkyou-9ece6.firebaseapp.com",
  projectId: "benkyou-9ece6",
  storageBucket: "benkyou-9ece6.firebasestorage.app",
  messagingSenderId: "766017318941",
  appId: "1:766017318941:web:d7fd0ed52818fc8f14d6f4",
  measurementId: "G-MKVVFB9ZCY"
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Add a document to a collection
 * @param {string} collectionName - Firestore collection name
 * @param {object} data - Document data object
 * @returns {Promise<string>} - Returns the new document ID
 */
export async function addDocument(collectionName, data) {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

/**
 * Delete a document from a collection by id
 * @param {string} collectionName
 * @param {string} docId
 */
export async function deleteDocument(collectionName, docId) {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

/**
 * Update a document by id with new data
 * @param {string} collectionName
 * @param {string} docId
 * @param {object} newData
 */
export async function updateDocument(collectionName, docId, newData) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, newData);
}

/**
 * Get a single document by id
 * @param {string} collectionName
 * @param {string} docId
 * @returns {Promise<object|null>} - Returns document data or null if not found
 */
export async function getDocument(collectionName, docId) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}

/**
 * Get all documents in a collection
 * @param {string} collectionName
 * @returns {Promise<Array<object>>} - Returns array of documents with id included
 */
export async function getAllDocuments(collectionName) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  const docs = [];
  snapshot.forEach(doc => {
    docs.push({ id: doc.id, ...doc.data() });
  });
  return docs;
}

/**
 * Query documents with where condition
 * @param {string} collectionName
 * @param {string} field - field name to query
 * @param {string} operator - e.g. "==", "<", ">"
 * @param {any} value - value to compare with
 * @returns {Promise<Array<object>>}
 */
export async function queryDocuments(collectionName, field, operator, value) {
  const colRef = collection(db, collectionName);
  const q = query(colRef, where(field, operator, value));
  const snapshot = await getDocs(q);
  const results = [];
  snapshot.forEach(doc => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
}
