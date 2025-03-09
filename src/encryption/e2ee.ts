import crypto from "crypto";

// 🔄 Криптографически безопасная перетасовка (Shuffle)
const secureShuffle = (str: string): string => {
    const array = str.split("");
    const randIndexes = crypto.randomBytes(array.length).map(v => v % array.length);

    for (let i = array.length - 1; i > 0; i--) {
        const j = randIndexes[i] % (i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
};

// 🔑 Генерация сессионного ключа
export const generateSessionKey = (token1: string, token2: string): string => {
    const shuffled = secureShuffle(token1) + secureShuffle(token2);
    return crypto.createHash("sha256").update(shuffled).digest("hex"); // ❌ Убрал `salt`, т.к. он ломает стабильность ключа
};

const deriveKey = (key: string): Buffer => {
    return crypto.pbkdf2Sync(key, "e2ee_salt", 100000, 32, "sha256");
};

// 🔐 Шифрование AES-256-GCM
export const encryptMessage = (message: string, key: string) => {
    const derivedKey = deriveKey(key);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, iv);

    let encrypted = cipher.update(message, "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag().toString("base64");

    console.log("🔐 Шифруем сообщение:");
    console.log("📥 IV:", iv.toString("base64"));
    console.log("📑 authTag:", authTag);
    console.log("📑 encrypted:", encrypted);

    return JSON.stringify({ iv: iv.toString("base64"), encrypted, authTag });
};

// 🔓 Расшифровка AES-256-GCM
export const decryptMessage = (encryptedData: string, key: string) => {
    try {
        const derivedKey = deriveKey(key);
        const { iv, encrypted, authTag } = JSON.parse(encryptedData);

        console.log("🔓 Расшифровываем сообщение:");
        console.log("📥 IV:", iv);
        console.log("📑 authTag:", authTag);
        console.log("📑 encrypted:", encrypted);

        if (!iv || !authTag || !encrypted) {
            throw new Error("❌ Ошибка: Данные повреждены, отсутствуют iv/authTag/encrypted.");
        }

        const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey, Buffer.from(iv, "base64"));
        decipher.setAuthTag(Buffer.from(authTag, "base64"));

        let decrypted = decipher.update(encrypted, "base64", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        console.error("❌ Ошибка расшифровки:", error);
        return "[Ошибка расшифровки]";
    }
};
