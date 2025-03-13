const MESSAGE_CACHE = "cached-messages";

export const getCachedMessages = async (chatId: number): Promise<any[] | null> => {
    const cache = await caches.open(MESSAGE_CACHE);
    const cachedResponse = await cache.match(`/messages/${chatId}`);
    if (cachedResponse) {
        return await cachedResponse.json();
    }
    return null;
};

export const cacheMessages = async (chatId: number, messages: any[]): Promise<void> => {
    const cache = await caches.open(MESSAGE_CACHE);
    const response = new Response(JSON.stringify(messages), { headers: { "Content-Type": "application/json" } });
    await cache.put(`/messages/${chatId}`, response);
};

export const clearMessageCache = async (): Promise<void> => {
    await caches.delete(MESSAGE_CACHE);
};
