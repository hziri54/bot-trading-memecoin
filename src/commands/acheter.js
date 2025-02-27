const { Markup } = require('telegraf');
const { Connection, PublicKey } = require("@solana/web3.js");

// Connexion à Solana
const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

// Stockage temporaire des sessions d'achat
const buySessions = {};

async function acheterCommand(ctx) {
    const userId = ctx.chat.id;

    // Demander l'adresse du token
    ctx.reply(
        "📥 *Veuillez entrer l'adresse du token que vous souhaitez acheter.*\n\n" +
        "Exemple : `YA9QnC78W3NK8z5xjTokbJ5m9aHutRz6vTGhvdzpump`",
        { parse_mode: 'Markdown' }
    );

    // Stocker l'état de l'achat
    buySessions[userId] = { step: 'waitingForToken' };
}

// Gestion des messages pour l'achat
async function handleMessage(ctx) {
    const userId = ctx.chat.id;
    const session = buySessions[userId];

    if (!session) return;

    const message = ctx.message.text.trim();

    if (session.step === 'waitingForToken') {
        if (message.length !== 44) {
            return ctx.reply("❌ *Adresse invalide.* Veuillez entrer une adresse Solana valide (44 caractères) :");
        }

        session.tokenAddress = message;
        session.step = 'waitingForAmount';

        return ctx.reply(
            "💰 *Veuillez entrer le montant en SOL que vous souhaitez investir dans ce token.*\n\n" +
            "Exemple : `0.1`",
            { parse_mode: 'Markdown' }
        );
    } else if (session.step === 'waitingForAmount') {
        const amount = parseFloat(message);
        if (isNaN(amount) || amount <= 0) {
            return ctx.reply("❌ *Montant invalide.* Veuillez entrer un montant valide en SOL.");
        }

        session.amount = amount;
        session.step = 'confirming';

        return ctx.reply(
            `🎉 *Achat confirmé !*\n\n` +
            `🔹 *Token :* \`${session.tokenAddress}\`\n` +
            `💸 *Montant :* ${session.amount} SOL\n\n` +
            `🔄 *Traitement en cours...*`,
            { parse_mode: 'Markdown' }
        );
    }
}

module.exports = {
    acheterCommand,
    handleMessage
};
