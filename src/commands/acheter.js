const { PublicKey } = require('@solana/web3.js');
const { Markup } = require('telegraf');

const acheterSessions = {};

// ✅ Fonction pour démarrer l'achat
async function startBuyingProcess(ctx) {
    const userId = ctx.chat.id;
    console.log(`🟢 [DEBUG] Démarrage du processus d'achat pour ${userId}`);

    // ✅ Stocke la session d'achat
    acheterSessions[userId] = { step: 1, tokenAddress: null, solAmount: null };

    await ctx.reply(
        `📥 *Veuillez entrer l'**adresse du token** que vous souhaitez acheter.*\n\nExemple : Es9vMFrzaCER1y9L9i8k1tC6rZr1kFj4s9Vb1t4jV9g`,
        { parse_mode: 'Markdown' }
    );
}

// ✅ Fonction pour gérer l'entrée de l'adresse du token
async function handleTokenAddress(ctx) {
    const userId = ctx.chat.id;
    const message = ctx.message.text.trim();

    console.log(`🔄 [DEBUG] Adresse du token reçue de ${userId}: ${message}`);

    // ✅ Vérification de l'adresse du token
    if (!isValidSolanaAddress(message)) {
        console.log(`❌ [DEBUG] Adresse invalide détectée: ${message}`);
        return ctx.reply("❌ Adresse invalide. Veuillez entrer une adresse Solana valide.");
    }

    // ✅ Enregistre l'adresse du token et passe à l'étape 2
    acheterSessions[userId].tokenAddress = message;
    acheterSessions[userId].step = 2;

    console.log(`✅ [DEBUG] Adresse du token stockée pour ${userId}: ${message}`);

    await ctx.reply(
        `💰 *Entrez maintenant le montant en SOL que vous souhaitez investir dans ce token.*\n\nExemple : 0.1`,
        { parse_mode: 'Markdown' }
    );
}

// ✅ Fonction pour gérer l'entrée du montant en SOL
async function handleInvestmentAmount(ctx) {
    const userId = ctx.chat.id;
    const message = ctx.message.text.trim();

    console.log(`🔄 [DEBUG] Montant reçu de ${userId}: ${message}`);

    const solAmount = parseFloat(message);
    if (isNaN(solAmount) || solAmount <= 0) {
        console.log(`❌ [DEBUG] Montant invalide détecté: ${message}`);
        return ctx.reply("❌ Montant invalide. Veuillez entrer un montant valide en SOL.");
    }

    // ✅ Enregistre le montant et demande confirmation
    acheterSessions[userId].solAmount = solAmount;
    acheterSessions[userId].step = 3;

    console.log(`✅ [DEBUG] Montant stocké pour ${userId}: ${solAmount} SOL`);

    await ctx.reply(
        `🔹 *Token :* ${acheterSessions[userId].tokenAddress}\n` +
        `💸 *Montant :* ${solAmount} SOL\n\n` +
        `✅ Confirmez votre achat ou annulez.`,
        Markup.inlineKeyboard([
            Markup.button.callback("✅ Confirmer", `confirm_acheter_${userId}`),
            Markup.button.callback("❌ Annuler", `cancel_acheter_${userId}`)
        ]),
        { parse_mode: 'Markdown' }
    );
}

// ✅ Confirmer l'achat
async function confirmAcheter(ctx) {
    const userId = ctx.from.id;
    const session = acheterSessions[userId];

    if (!session) return ctx.reply("❌ Achat annulé ou session expirée.");

    console.log(`🟢 [DEBUG] Achat confirmé pour ${userId}`);

    await ctx.reply("🔄 *Exécution de la transaction...*");

    // 🔴 FAKE TRANSACTION → À remplacer par l'intégration Solana
    const transactionId = "FAKE_TX_HASH"; 

    await ctx.reply(
        `🎉 *Achat réussi !*\n\n` +
        `🔹 *Token acheté:* ${session.tokenAddress}\n` +
        `💸 *Montant dépensé:* ${session.solAmount} SOL\n\n` +
        `🔗 [Voir la transaction sur Solscan](https://solscan.io/tx/${transactionId})`,
        { parse_mode: "Markdown" }
    );

    delete acheterSessions[userId]; // Supprime la session après l'achat
}

// ❌ Annuler l'achat
async function cancelAcheter(ctx) {
    const userId = ctx.from.id;

    if (!acheterSessions[userId]) {
        return ctx.reply("❌ Aucune session d'achat en cours.");
    }

    console.log(`🛑 [DEBUG] Achat annulé pour ${userId}`);

    delete acheterSessions[userId];
    await ctx.reply("🚫 *Achat annulé.*", { parse_mode: 'Markdown' });
}

// ✅ Fonction pour vérifier une adresse Solana
function isValidSolanaAddress(address) {
    try {
        new PublicKey(address);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = { startBuyingProcess, handleTokenAddress, handleInvestmentAmount, confirmAcheter, cancelAcheter };
