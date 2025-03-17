const MEDIA_CACHE = "cached-media";

export const getCachedMedia = async (mediaUrl: string): Promise<string | null> => {
    const cache = await caches.open(MEDIA_CACHE);
    const cachedResponse = await cache.match(mediaUrl);
    if (cachedResponse) {
        return URL.createObjectURL(await cachedResponse.blob());
    }
    return null;
};

export const cacheMedia = async (mediaUrl: string, mediaBlob: Blob): Promise<void> => {
    const cache = await caches.open(MEDIA_CACHE);
    const response = new Response(mediaBlob, { headers: { "Content-Type": mediaBlob.type } });
    await cache.put(mediaUrl, response);
};

// 📌 Очистка кэша медиафайлов
export const clearMediaCache = async () => {
    await caches.delete(MEDIA_CACHE);
};
