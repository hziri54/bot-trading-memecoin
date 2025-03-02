const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require("@solana/web3.js");
const fs = require("fs");

const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

const acheterSessions = {}; // Stockage des sessions d'achat

async function acheterCommand(ctx) {
    const userId = ctx.chat.id;
    acheterSessions[userId] = { step: 1 }; // Étape 1 : Demander l'adresse du token

    console.log(`🔄 [DEBUG] Démarrage d'une session d'achat pour ${userId}`);

    await ctx.reply("📥 Veuillez entrer l'adresse du token que vous souhaitez acheter.\n\nExemple : YA9QnC78W3NK8z5xjTokbJ5m9aHutRz6vTGhvdzpump");
}

// ✅ Étape 1 : Récupérer l'adresse du token
async function handleTokenAddress(ctx) {
    const userId = ctx.chat.id;
    if (!acheterSessions[userId] || acheterSessions[userId].step !== 1) return;

    const tokenAddress = ctx.message.text.trim();
    console.log(`✅ [DEBUG] Adresse token reçue : ${tokenAddress}`);

    if (tokenAddress.length !== 44) {
        await ctx.reply("❌ Adresse invalide. Veuillez entrer une adresse Solana valide.");
        return;
    }

    acheterSessions[userId].tokenAddress = tokenAddress;
    acheterSessions[userId].step = 2;

    await ctx.reply("💰 Combien de SOL souhaitez-vous investir dans ce token ?\n\nExemple : 0.1");
}

// ✅ Étape 2 : Récupérer le montant en SOL
async function handleInvestmentAmount(ctx) {
    const userId = ctx.chat.id;
    if (!acheterSessions[userId] || acheterSessions[userId].step !== 2) return;

    const solAmount = parseFloat(ctx.message.text.trim());
    console.log(`💸 [DEBUG] Montant reçu : ${solAmount} SOL`);

    if (isNaN(solAmount) || solAmount <= 0) {
        await ctx.reply("❌ Montant invalide. Veuillez entrer une valeur en SOL.");
        return;
    }

    acheterSessions[userId].solAmount = solAmount;
    acheterSessions[userId].step = 3;

    await ctx.reply(
        `🎯 **Confirmez votre achat ?**\n\n` +
        `🔹 Token : ${acheterSessions[userId].tokenAddress}\n` +
        `💸 Montant : ${solAmount} SOL\n\n`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Confirmer", callback_data: `confirm_acheter_${userId}` }],
                    [{ text: "❌ Annuler", callback_data: `cancel_acheter_${userId}` }]
                ]
            }
        }
    );
}

// ✅ Étape 3 : Exécuter l'achat sur Solana
async function confirmAcheter(ctx) {
    const userId = ctx.chat.id;
    if (!acheterSessions[userId] || acheterSessions[userId].step !== 3) return;

    console.log(`⚡ [DEBUG] Exécution de l'achat pour ${userId}...`);

    const walletPath = `./wallets/${userId}.json`;
    if (!fs.existsSync(walletPath)) {
        await ctx.reply("❌ *Erreur : Wallet introuvable.* Utilisez `/bienvenue` pour créer un wallet.");
        return;
    }

    const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
    const publicKey = new PublicKey(walletData.publicKey);
    const privateKey = Uint8Array.from(Buffer.from(walletData.privateKey, "hex"));
    const payer = Keypair.fromSecretKey(privateKey);

    // ✅ Vérification du solde
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / 1e9;
    if (solBalance < acheterSessions[userId].solAmount) {
        await ctx.reply(`❌ Solde insuffisant. Votre solde est de ${solBalance} SOL.`);
        return;
    }

    // ✅ Création de la transaction Solana
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: new PublicKey(acheterSessions[userId].tokenAddress),
            lamports: acheterSessions[userId].solAmount * 1e9,
        })
    );

    try {
        console.log(`📤 [DEBUG] Envoi de la transaction d'achat pour ${userId}...`);

        const signature = await connection.sendTransaction(transaction, [payer]);
        await connection.confirmTransaction(signature, "confirmed");

        await ctx.reply(`✅ **Achat réussi !**\n\n📜 Transaction : [Voir sur Solscan](https://solscan.io/tx/${signature})`);
        console.log(`🎉 [DEBUG] Achat terminé avec succès : ${signature}`);

    } catch (err) {
        console.error(`❌ [ERROR] Erreur lors de l'achat : ${err}`);
        await ctx.reply("❌ Une erreur est survenue lors de la transaction.");
    }

    delete acheterSessions[userId];
}

// ✅ Annulation de l'achat
async function cancelAcheter(ctx) {
    const userId = ctx.chat.id;
    console.log(`❌ [DEBUG] Achat annulé pour ${userId}`);
    delete acheterSessions[userId];
    await ctx.reply("❌ Achat annulé.");
}

module.exports = {
    acheterCommand,
    handleTokenAddress,
    handleInvestmentAmount,
    confirmAcheter,
    cancelAcheter
};
