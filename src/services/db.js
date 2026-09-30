// src/services/db.js
const DB_NAME = 'ZeiterfassungDB';
const STORE_NAME = 'appState';
const DB_VERSION = 1;

export async function requestPersistence() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.info(`Storage Persistence: ${isPersisted ? 'Aktiv' : 'Nicht garantiert'}`);
    }
}

export function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.error);
    });
}

export async function saveToDB(data) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(data, 'main');
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.error);
    });
}

export async function loadFromDB() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get('main');
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.error);
    });
}