
const { Connection, PublicKey, Transaction, sendAndConfirmTransaction } = require("@solana/web3.js");
const fetch = require("node-fetch");
const fs = require("fs");

const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

async function executeSwap(userId, tokenAddress, solAmount) {
    try {
        console.log(`🚀 Exécution de l'achat : ${solAmount} SOL pour ${tokenAddress}`);

        const walletPath = `./wallets/${userId}.json`;
        if (!fs.existsSync(walletPath)) {
            console.log("❌ Wallet introuvable.");
            return null;
        }

        const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
        const userWallet = new PublicKey(walletData.publicKey);

        // Récupérer le prix sur Jupiter
        const jupiterUrl = `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${tokenAddress}&amount=${solAmount * 1e9}&slippageBps=50`;
        
        const response = await fetch(jupiterUrl);
        const quoteData = await response.json();

        if (!quoteData) {
            console.log("❌ Impossible d'obtenir un prix.");
            return null;
        }

        console.log("✅ Prix obtenu:", quoteData);

        // Création de la transaction Solana
        const transaction = new Transaction();
        transaction.add({
            keys: [
                { pubkey: userWallet, isSigner: true, isWritable: true },
                { pubkey: new PublicKey(tokenAddress), isSigner: false, isWritable: true },
            ],
            programId: new PublicKey("JupiterAggregatorProgramID"),
            data: Buffer.alloc(0),
        });

        // Signature et envoi de la transaction
        const signature = await sendAndConfirmTransaction(connection, transaction, [walletData.privateKey]);
        console.log("✅ Transaction confirmée :", signature);
        
        return signature;
    } catch (err) {
        console.error("❌ Erreur lors de l'exécution de l'achat :", err);
        return null;
    }
}

module.exports = { executeSwap };
