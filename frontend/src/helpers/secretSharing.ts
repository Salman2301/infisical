import { SECRET_SHARING_PASSPHRASE } from "@app/components/utilities/config";

async function genAesKey(passphrase?: string) {
  const encoder = new TextEncoder();
  const passphraseBuffer = encoder.encode(passphrase || SECRET_SHARING_PASSPHRASE);
  console.log({ SECRET_SHARING_PASSPHRASE })
  const derivedKeyTypeOpts = {
    keyFormat: "raw",
    algorithm: { name: "PBKDF2" },
    extractable: false,
    keyUsages: ["deriveKey"]
  } as const;
  
  const aesKeyOpts = {
    algorithm: {
      name: "PBKDF2",
      salt: new Uint8Array(16),
      iterations: 100000,
      hash: "SHA-256"
    },
    derivedKeyType: { name: "AES-CBC", length: 256 },
    extractable: true,
    keyUsages: ["encrypt", "decrypt"]
  } as const;

  const derivedKey = await crypto.subtle.importKey(
    derivedKeyTypeOpts.keyFormat,
    passphraseBuffer,
    derivedKeyTypeOpts.algorithm,
    derivedKeyTypeOpts.extractable,
    derivedKeyTypeOpts.keyUsages
  );

  const aesKey = await crypto.subtle.deriveKey(
    aesKeyOpts.algorithm,
    derivedKey,
    aesKeyOpts.derivedKeyType,
    aesKeyOpts.extractable,
    aesKeyOpts.keyUsages
  );
  const iv = crypto.getRandomValues(new Uint8Array(16));

  return { aesKey, algorithm: { name: "AES-CBC", iv }, iv };
}

function bufferToBase64(buffer: ArrayBuffer) {
  return Buffer.from(buffer).toString("base64");
}

function base64ToBuffer(base64Content: string) {
  return Buffer.from(base64Content, "base64");
}

export async function encrypt(data: string, passphrase?: string) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const { algorithm, aesKey, iv } = await genAesKey(passphrase);
  const encryptedData = await crypto.subtle.encrypt(algorithm, aesKey, dataBuffer);
  return {
    iv: bufferToBase64(iv as Uint8Array),
    cipher: bufferToBase64(encryptedData)
  };
}

export async function decrypt(encryptedDataBase64: string, ivBase64: string, passphrase?: string) {
  const { algorithm, aesKey } = await genAesKey(passphrase);

  const decryptedData = await crypto.subtle.decrypt(
    { ...algorithm, iv: base64ToBuffer(ivBase64) },
    aesKey,
    base64ToBuffer(encryptedDataBase64)
  );

  const decoder = new TextDecoder();
  const decryptedText = decoder.decode(decryptedData);

  return {
    iv: ivBase64,
    data: decryptedText
  };
}
