import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {jwtDecode} from 'jwt-decode';

interface SessionDB extends DBSchema {
    sessions: {
        key: string; // используем фиксированный ключ, например "sessions"
        value: any[];
    };
}

interface DecodedToken {
    sessionId: string;
}



let dbPromise: Promise<IDBPDatabase<SessionDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<SessionDB>('SessionDB', 1, {
            upgrade(db) {
                db.createObjectStore('sessions');
            },
        });
    }
    return dbPromise;
}

export async function cacheSessionsIndexedDB(sessions: any[]): Promise<void> {
    const db = await getDB();
    await db.put('sessions', sessions, 'sessions');
}

export async function getCachedSessionsIndexedDB(): Promise<any[] | null> {
    const db = await getDB();
    const sessions = await db.get('sessions', 'sessions');

    if (sessions && sessions.length > 0) {
        return sessions;
    }

    // 🧠 Достаём sessionId из JWT
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decodedToken: DecodedToken = jwtDecode(token);
        if (decodedToken?.sessionId) {
            return [{
                sessionId: decodedToken.sessionId,
            }];
        }
    } catch (e) {
        console.warn('❌ Ошибка декодирования JWT:', e);
    }

    return null;
}
