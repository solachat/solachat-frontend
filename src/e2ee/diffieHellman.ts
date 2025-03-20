export const generateDHKeys = (g: bigint, p: bigint): { privateKey: bigint; publicKey: bigint } => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);

    const privateKeyHex = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    const privateKey = BigInt("0x" + privateKeyHex);

    const publicKey = modExp(g, privateKey, p);

    return { privateKey, publicKey };
};


export const computeSharedSecret = (privateKey: bigint, receivedPublicKey: bigint, p: bigint): bigint => {
    return modExp(receivedPublicKey, privateKey, p);
};

const modExp = (base: bigint, exponent: bigint, mod: bigint): bigint => {
    let result = BigInt(1);
    base = base % mod;
    while (exponent > 0) {
        if (exponent % BigInt(2) === BigInt(1)) {
            result = (result * base) % mod;
        }
        exponent = exponent >> BigInt(1);
        base = (base * base) % mod;
    }
    return result;
};
