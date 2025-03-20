export const encryptMessage = async (message: string, key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(key),
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        keyMaterial,
        encoder.encode(message)
    );

    const ivArray = Array.from(iv);
    const encryptedArray = Array.from(new Uint8Array(encrypted));

    return btoa(String.fromCharCode(...ivArray, ...encryptedArray));
};


export const decryptMessage = async (encryptedMessage: string, key: string): Promise<string> => {
    const decoder = new TextDecoder();
    const encodedData = atob(encryptedMessage);
    const iv = new Uint8Array(encodedData.slice(0, 12).split("").map(c => c.charCodeAt(0)));
    const data = new Uint8Array(encodedData.slice(12).split("").map(c => c.charCodeAt(0)));

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key),
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, keyMaterial, data);
    return decoder.decode(decrypted);
};
