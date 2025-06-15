// IndexedDB for offline storage
const dbName = 'hollyNameDB';
const dbVersion = 1;

class HollyDB {
    constructor() {
        this.db = null;
        this.initDB();
    }

    initDB() {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log('Database opened successfully');
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Store for generated names
            if (!db.objectStoreNames.contains('generatedNames')) {
                const nameStore = db.createObjectStore('generatedNames', { keyPath: 'id', autoIncrement: true });
                nameStore.createIndex('timestamp', 'timestamp');
            }

            // Store for favorite names
            if (!db.objectStoreNames.contains('favorites')) {
                const favStore = db.createObjectStore('favorites', { keyPath: 'name' });
                favStore.createIndex('timestamp', 'timestamp');
            }

            // Store for quiz results
            if (!db.objectStoreNames.contains('quizResults')) {
                const quizStore = db.createObjectStore('quizResults', { keyPath: 'id', autoIncrement: true });
                quizStore.createIndex('timestamp', 'timestamp');
            }

            // Store for pending operations (for background sync)
            if (!db.objectStoreNames.contains('pendingOperations')) {
                const syncStore = db.createObjectStore('pendingOperations', { keyPath: 'id', autoIncrement: true });
                syncStore.createIndex('type', 'type');
                syncStore.createIndex('timestamp', 'timestamp');
            }
        };
    }

    async saveGeneratedNames(names) {
        return this.addToStore('generatedNames', {
            names,
            timestamp: new Date().toISOString()
        });
    }

    async saveFavorite(name, meaning) {
        return this.addToStore('favorites', {
            name,
            meaning,
            timestamp: new Date().toISOString()
        });
    }

    async saveQuizResult(result) {
        return this.addToStore('quizResults', {
            ...result,
            timestamp: new Date().toISOString()
        });
    }

    async getFavorites() {
        return this.getAllFromStore('favorites');
    }

    async getRecentGeneratedNames(limit = 10) {
        const names = await this.getAllFromStore('generatedNames');
        return names.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
    }

    async getQuizHistory() {
        return this.getAllFromStore('quizResults');
    }

    async addPendingOperation(operation) {
        return this.addToStore('pendingOperations', {
            ...operation,
            timestamp: new Date().toISOString()
        });
    }

    async getPendingOperations() {
        return this.getAllFromStore('pendingOperations');
    }

    async clearPendingOperation(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pendingOperations'], 'readwrite');
            const store = transaction.objectStore('pendingOperations');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Helper methods
    async addToStore(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

const hollyDB = new HollyDB();
export default hollyDB;
