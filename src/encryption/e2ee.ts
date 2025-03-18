import crypto from "crypto";

// 🔄 Перемешивание (Shuffle)
const secureShuffle = (str: string): string => {
    const array = str.split("");
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
};

// 🔑 Генерация сессионного ключа (256 бит)
export const generateSessionKey = (publicKeyA: string, publicKeyB: string): string => {
    const combinedKey = secureShuffle(publicKeyA) + secureShuffle(publicKeyB);
    return crypto.createHash("sha256").update(combinedKey).digest("hex").slice(0, 32); // Гарантированные 32 байта
};

// 📌 Определяем, работает ли код в браузере или на сервере
const isBrowser = typeof window !== "undefined";

/**
 * 🔑 Преобразование ключа в `CryptoKey` (для WebCrypto API)
 */
export const deriveAESKey = async (keyMaterial: string): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyBytes = enc.encode(keyMaterial.slice(0, 32)); // Гарантированные 32 байта

    return await window.crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
};

/**
 * 🔐 Шифрование AES-256-GCM
 */
export const encryptMessage = async (message: string, sessionKey: string) => {
    const encoder = new TextEncoder();
    const iv = isBrowser ? window.crypto.getRandomValues(new Uint8Array(12)) : crypto.randomBytes(12);

    if (isBrowser) {
        const key = await deriveAESKey(sessionKey);

        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoder.encode(message)
        );

        return JSON.stringify({
            iv: Array.from(iv),
            encrypted: Array.from(new Uint8Array(encrypted)),
        });
    } else {
        const derivedKey = crypto.pbkdf2Sync(sessionKey, "e2ee_salt", 100000, 32, "sha256");
        const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, iv);

        let encrypted = cipher.update(message, "utf8", "base64");
        encrypted += cipher.final("base64");
        const authTag = cipher.getAuthTag().toString("base64");

        return JSON.stringify({ iv: iv.toString("base64"), encrypted, authTag });
    }
};

/**
 * 🔓 Расшифровка AES-256-GCM
 */
export const decryptMessage = async (encryptedData: string, sessionKey: string) => {
    const decoder = new TextDecoder();
    const { iv, encrypted, authTag } = JSON.parse(encryptedData);

    if (isBrowser) {
        const key = await deriveAESKey(sessionKey);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            key,
            new Uint8Array(encrypted)
        );

        return decoder.decode(decrypted);
    } else {
        const derivedKey = crypto.pbkdf2Sync(sessionKey, "e2ee_salt", 100000, 32, "sha256");
        const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey, Buffer.from(iv, "base64"));
        decipher.setAuthTag(Buffer.from(authTag, "base64"));

        let decrypted = decipher.update(encrypted, "base64", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    }
};
