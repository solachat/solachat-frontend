const AVATAR_CACHE = "media-avatars";
const PROFILE_CACHE = "profile-cache";

export const getCachedAvatar = async (avatarUrl: string): Promise<Blob | null> => {
    const cache = await caches.open("avatar-cache");
    const cachedResponse = await cache.match(avatarUrl);
    if (cachedResponse) {
        return await cachedResponse.blob(); // ✅ Возвращаем `Blob`, а не строку
    }
    return null;
};


export const cacheAvatar = async (avatarUrl: string, imageBlob: Blob): Promise<void> => {
    const cache = await caches.open(AVATAR_CACHE);
    const response = new Response(imageBlob, { headers: { "Content-Type": imageBlob.type } });
    await cache.put(avatarUrl, response);
};

export const getCachedProfile = async (identifier: string): Promise<any | null> => {
    const cache = await caches.open(PROFILE_CACHE);
    const cachedResponse = await cache.match(identifier);
    if (cachedResponse) {
        return await cachedResponse.json();
    }
    return null;
};

export const cacheProfile = async (identifier: string, profileData: any, avatarBlob?: Blob) => {
    const cache = await caches.open(PROFILE_CACHE);

    if (avatarBlob) {
        await cacheAvatar(profileData.avatar, avatarBlob);
        profileData.cachedAvatar = profileData.avatar;
    }

    const response = new Response(JSON.stringify(profileData), { headers: { "Content-Type": "application/json" } });
    await cache.put(identifier, response);
};

export const clearCache = async () => {
    await caches.delete(AVATAR_CACHE);
    await caches.delete(PROFILE_CACHE);
};
