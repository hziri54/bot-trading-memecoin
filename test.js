const { Keypair } = require('@solana/web3.js');

const keypair = Keypair.generate();
const privateKeyArray = Array.from(keypair.secretKey);
const privateKeyHex = Buffer.from(privateKeyArray).toString('hex');
const privateKeyBase64 = Buffer.from(privateKeyArray).toString('base64');

console.log("✅ Public Key:", keypair.publicKey.toString());
console.log("🔑 Private Key (Array):", privateKeyArray);
console.log("🔑 Private Key (HEX):", privateKeyHex);
console.log("🔑 Private Key (Base64):", privateKeyBase64);
