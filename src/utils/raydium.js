const fs = require("fs");
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require("@solana/web3.js");

const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

/**
 * Exécute un swap sur Raydium
 * @param {string} userId - ID utilisateur
 * @param {string} tokenAddress - Adresse du token
 * @param {number} solAmount - Montant en SOL
 * @returns {string|null} - ID de transaction
 */
async function tradeCurrency(userId, tokenAddress, solAmount) {
    try {
        console.log(`🔄 [DEBUG] Démarrage du swap pour ${userId}`);
        
        // Charger le wallet
        const walletPath = `./wallets/${userId}.json`;
        if (!fs.existsSync(walletPath)) {
            console.log("❌ [DEBUG] Wallet non trouvé !");
            return null;
        }

        const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
        const userKeypair = Keypair.fromSecretKey(Buffer.from(walletData.privateKey, "hex"));

        console.log(`🔹 [DEBUG] Wallet chargé pour ${userId}: ${userKeypair.publicKey.toString()}`);

        let transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: userKeypair.publicKey,
                toPubkey: new PublicKey(tokenAddress),
                lamports: solAmount * 1e9
            })
        );

        transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
        transaction.sign(userKeypair);
        const txid = await connection.sendTransaction(transaction, [userKeypair]);

        console.log(`✅ [DEBUG] Transaction envoyée: ${txid}`);
        return txid;
    } catch (error) {
        console.error("❌ [DEBUG] Erreur lors du trade:", error);
        return null;
    }
}

module.exports = { tradeCurrency };
