const CHAT_CACHE = "cached-chats";

// 📌 Получение чатов из `Cache Storage`
export const getCachedChats = async (): Promise<any[] | null> => {
    const cache = await caches.open(CHAT_CACHE);
    const cachedResponse = await cache.match("/chats");

    if (cachedResponse) {
        const data = await cachedResponse.json();
        console.log("📌 Чаты найдены в кэше:", data);
        return data;
    }

    console.warn("⚠️ В `Cache Storage` нет данных `/chats`");
    return null;
};


// 📌 Кэширование списка чатов
export const cacheChats = async (chats: any[]): Promise<void> => {
    console.log("📌 Кэшируем чаты:", chats); // ✅ Проверяем, что сохраняем
    const cache = await caches.open(CHAT_CACHE);
    const response = new Response(JSON.stringify(chats), { headers: { "Content-Type": "application/json" } });
    await cache.put("/chats", response);
};


// 📌 Очистка кэша чатов
export const clearChatCache = async (): Promise<void> => {
    await caches.delete(CHAT_CACHE);
};
