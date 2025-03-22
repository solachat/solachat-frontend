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

export const getSessionKey = async (sessionId: string): Promise<Uint8Array | null> => {
    const sessions = await getCachedSessionsIndexedDB();

    if (!sessions || sessions.length === 0) {
        console.warn('🔐 Нет сессий в кэше IndexedDB');
        return null;
    }

    const session = sessions.find((s) => s.sessionId === sessionId);

    if (!session || !session.sharedKey) {
        console.warn(`🔐 SessionKey для ${sessionId} не найден`);
        return null;
    }

    try {
        const keyBytes = Uint8Array.from(atob(session.sharedKey), c => c.charCodeAt(0));
        return keyBytes;
    } catch (e) {
        console.error('❌ Ошибка при декодировании sharedKey:', e);
        return null;
    }
};
