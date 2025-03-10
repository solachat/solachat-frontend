export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
    return keyPair;
}

<<<<<<< Updated upstream
export async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('spki', key);
    return Buffer.from(exported).toString('base64');
}

export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
    const binaryDer = Buffer.from(base64Key, 'base64');
    return window.crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt"]
    );
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('pkcs8', key);
    return Buffer.from(exported).toString('base64');
}

export async function importPrivateKey(base64Key: string): Promise<CryptoKey> {
    const binaryDer = Buffer.from(base64Key, 'base64');
    return window.crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["decrypt"]
    );
}

export async function encryptSymmetric(key: CryptoKey, message: string): Promise<{ iv: string, content: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedMessage = new TextEncoder().encode(message);
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encodedMessage
    );
    return {
        iv: Buffer.from(iv).toString('hex'),
        content: Buffer.from(encrypted).toString('hex')
    };
}

export async function decryptSymmetric(key: CryptoKey, iv: string, encryptedMessage: string): Promise<string> {
    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedBuffer = Buffer.from(encryptedMessage, 'hex');
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: ivBuffer,
        },
        key,
        encryptedBuffer
    );
    return new TextDecoder().decode(decrypted);
}

export async function encryptSymmetricKey(publicKey: CryptoKey, symmetricKey: CryptoKey): Promise<string> {
    const exportedSymmetricKey = await window.crypto.subtle.exportKey('raw', symmetricKey);
    const encryptedSymmetricKey = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        exportedSymmetricKey
    );
    return Buffer.from(encryptedSymmetricKey).toString('base64');
}

export async function decryptSymmetricKey(privateKey: CryptoKey, encryptedKey: string): Promise<CryptoKey> {
    const encryptedKeyBuffer = Buffer.from(encryptedKey, 'base64');
    const decryptedSymmetricKey = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        privateKey,
        encryptedKeyBuffer
    );
    return window.crypto.subtle.importKey(
        'raw',
        decryptedSymmetricKey,
        {
            name: "AES-GCM",
        },
        true,
        ['encrypt', 'decrypt']
    );
}
=======
// Кэш сессионных ключей в памяти
const sessionKeyCache = new Map<string, string>();

export const encryptChatMessage = async (message: string, token1: string, token2: string) => {
    let sessionKey = sessionKeyCache.get(token1 + token2);

    if (!sessionKey) {
        sessionKey = generateSessionKey(token1, token2);
        sessionKeyCache.set(token1 + token2, sessionKey);
        sessionStorage.setItem("sessionKey", sessionKey); // Временное хранение, исчезает после перезапуска
        console.log("🔑 Новый сессионный ключ сгенерирован и сохранён:", sessionKey);
    } else {
        console.log("🔑 Используем сохранённый сессионный ключ:", sessionKey);
    }

    return encryptMessage(message, sessionKey);
};

export const decryptChatMessage = async (encryptedMessage: string, token1: string, token2: string) => {
    let sessionKey = sessionKeyCache.get(token1 + token2);

    if (!sessionKey) {
        sessionKey = sessionStorage.getItem("sessionKey") || generateSessionKey(token1, token2);
        sessionKeyCache.set(token1 + token2, sessionKey);
        console.log("🔑 Новый сессионный ключ сгенерирован и сохранён (для расшифровки):", sessionKey);
    } else {
        console.log("🔑 Используем сохранённый сессионный ключ (для расшифровки):", sessionKey);
    }

    return decryptMessage(encryptedMessage, sessionKey);
};
>>>>>>> Stashed changes
