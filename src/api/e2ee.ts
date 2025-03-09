import { encryptMessage, decryptMessage, generateSessionKey } from "../encryption/e2ee";

export const encryptChatMessage = (message: string, token1: string, token2: string) => {
    let sessionKey = localStorage.getItem("sessionKey");
    if (!sessionKey) {
        sessionKey = generateSessionKey(token1, token2);
        localStorage.setItem("sessionKey", sessionKey);
        console.log("🔑 Новый сессионный ключ сгенерирован и сохранён:", sessionKey);
    } else {
        console.log("🔑 Используем сохранённый сессионный ключ:", sessionKey);
    }
    return encryptMessage(message, sessionKey);
};


export const decryptChatMessage = (encryptedMessage: string, token1: string, token2: string) => {
    let sessionKey = localStorage.getItem("sessionKey");
    if (!sessionKey) {
        // Если вдруг ключ не найден, можно его сгенерировать
        sessionKey = generateSessionKey(token1, token2);
        localStorage.setItem("sessionKey", sessionKey);
        console.log("🔑 Новый сессионный ключ сгенерирован и сохранён (для расшифровки):", sessionKey);
    } else {
        console.log("🔑 Используем сохранённый сессионный ключ (для расшифровки):", sessionKey);
    }
    return decryptMessage(encryptedMessage, sessionKey);
};
