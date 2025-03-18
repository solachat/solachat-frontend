import { encryptMessage, decryptMessage, generateSessionKey } from "../encryption/e2ee";

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
