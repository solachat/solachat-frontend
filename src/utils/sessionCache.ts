import { getSessions } from "../api/api";
import { cacheSessionsIndexedDB, getCachedSessionsIndexedDB } from './sessionIndexedDB';

export async function loadAndCacheSessions(userId: number, token: string): Promise<any[]> {
    try {
        const sessions = await getSessions(userId, token);
        console.log("📱 Активные сессии:", sessions);
        await cacheSessionsIndexedDB(sessions);
        return sessions;
    } catch (error) {
        console.warn("⚠️ Не удалось загрузить сеансы, пытаемся получить кэшированные данные", error);
        const cached = await getCachedSessionsIndexedDB();
        return cached ? cached : [];
    }
}
