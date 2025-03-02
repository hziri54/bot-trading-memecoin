const { Connection } = require('@solana/web3.js');

// ✅ Connexion à Solana (Mainnet)
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

console.log("✅ Connexion à Solana établie avec succès !");

module.exports = { connection };
