require('dotenv').config();
const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');
const { PublicKey, Connection } = require('@solana/web3.js');
const { startBuyingProcess, handleTokenAddress, handleInvestmentAmount, confirmAcheter, cancelAcheter } = require('./src/commands/acheter');
const bienvenueCommand = require("./src/commands/bienvenue");

const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN est manquant !");
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
console.log("✅ Bot lancé avec succès !");

// ✅ Stockage des sessions d'achat
const acheterSessions = {};

// ✅ Commande Bienvenue (Première connexion)
bot.command("bienvenue", bienvenueCommand);

// ✅ Commande Continuer (Accéder au menu principal)
bot.command('continuer', async (ctx) => {
    const userId = ctx.chat.id;
    const walletPath = `./wallets/${userId}.json`;

    if (!fs.existsSync(walletPath)) {
        return ctx.reply("❌ *Aucun wallet trouvé.* Utilisez `/bienvenue` pour en créer un.");
    }

    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const publicKey = new PublicKey(walletData.publicKey);
    const balance = await connection.getBalance(publicKey);
    const solBalance = (balance / 1e9).toFixed(4);

    await ctx.reply(
        `💰 *Solana Wallet · 📈*\n\n` +
        `💼 *Adresse:* \`${walletData.publicKey}\`\n\n` +
        `💸 *Solde:* ${solBalance} SOL\n\n` +
        `🔄 Cliquez sur *Refresh* pour mettre à jour le solde.`,
        Markup.inlineKeyboard([
            [Markup.button.callback("📋 Copier Adresse", `copy_address_${userId}`)],
            [Markup.button.callback("🔄 Refresh", "refresh_solde")],
            [Markup.button.callback("🛒 Acheter", "acheter"), Markup.button.callback("📤 Vendre", "vendre")],
            [Markup.button.callback("⚙️ Paramètres", "settings")]
        ]),
        { parse_mode: 'Markdown' }
    );
});

// ✅ Copier l'adresse du wallet
bot.action(/^copy_address_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];
    const walletPath = `./wallets/${userId}.json`;

    if (!fs.existsSync(walletPath)) {
        return ctx.reply("❌ *Aucun wallet trouvé.*");
    }

    const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
    await ctx.reply(`📋 *Adresse copiée:* \`${walletData.publicKey}\``, { parse_mode: "Markdown" });
});

// ✅ Rafraîchir le solde
bot.action('refresh_solde', async (ctx) => {
    const userId = ctx.chat.id;
    const walletPath = `./wallets/${userId}.json`;

    if (!fs.existsSync(walletPath)) {
        return ctx.reply("❌ *Aucun wallet trouvé.* Utilisez `/bienvenue` pour en créer un.");
    }

    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const publicKey = new PublicKey(walletData.publicKey);
    const balance = await connection.getBalance(publicKey);
    const solBalance = (balance / 1e9).toFixed(4);

    await ctx.editMessageText(
        `💰 *Solana Wallet · 📈*\n\n` +
        `💼 *Adresse:* \`${walletData.publicKey}\`\n\n` +
        `💸 *Solde:* ${solBalance} SOL\n\n` +
        `🔄 Cliquez sur *Refresh* pour mettre à jour le solde.`,
        Markup.inlineKeyboard([
            [Markup.button.callback("📋 Copier Adresse", `copy_address_${userId}`)],
            [Markup.button.callback("🔄 Refresh", "refresh_solde")],
            [Markup.button.callback("🛒 Acheter", "acheter"), Markup.button.callback("📤 Vendre", "vendre")],
            [Markup.button.callback("⚙️ Paramètres", "settings")]
        ]),
        { parse_mode: 'Markdown' }
    );
});

// ✅ Lancer l'achat
bot.action('acheter', async (ctx) => {
    await startBuyingProcess(ctx);
});

// ✅ Écoute des messages utilisateur pour l'achat (Adresse & Montant)
bot.on('text', async (ctx) => {
    const userId = ctx.chat.id;
    const message = ctx.message.text.trim();

    console.log(`🔄 [DEBUG] Message reçu de ${userId}: ${message}`);

    if (acheterSessions[userId]) {
        console.log(`🟡 [DEBUG] Session d'achat détectée pour ${userId}. Étape: ${acheterSessions[userId].step}`);

        if (acheterSessions[userId].step === 1) {
            console.log(`🟢 [DEBUG] Exécution de handleTokenAddress()`);
            return await handleTokenAddress(ctx, acheterSessions);
        }
        if (acheterSessions[userId].step === 2) {
            console.log(`🟢 [DEBUG] Exécution de handleInvestmentAmount()`);
            return await handleInvestmentAmount(ctx, acheterSessions);
        }
    }
});

// ✅ Confirmation et annulation de l'achat
bot.action(/^confirm_acheter_(\d+)$/, async (ctx) => {
    await confirmAcheter(ctx);
});
bot.action(/^cancel_acheter_(\d+)$/, async (ctx) => {
    await cancelAcheter(ctx);
});

// ✅ Exécuter l'achat (DEBUG: Remplace FAKE_TX_HASH par une vraie transaction)
bot.action(/^execute_achat_(\d+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const session = acheterSessions[userId];

    if (!session) return ctx.reply("❌ Achat annulé ou session expirée.");

    await ctx.reply("🔄 *Exécution de la transaction...*");

    // FAKE_TX_HASH → Remplace par la vraie transaction
    const transactionId = "FAKE_TX_HASH"; 

    if (!transactionId) {
        return ctx.reply("❌ Échec de l'achat. Vérifiez votre solde et réessayez.");
    }

    await ctx.reply(
        `🎉 *Achat réussi !*\n\n` +
        `🔹 *Token acheté:* ${session.tokenAddress}\n` +
        `💸 *Montant dépensé:* ${session.solAmount} SOL\n\n` +
        `🔗 [Voir la transaction sur Solscan](https://solscan.io/tx/${transactionId})`,
        { parse_mode: "Markdown" }
    );

    delete acheterSessions[userId]; // Supprime la session après l'achat
});

// ✅ Lancement du bot
bot.launch()
    .then(() => console.log("✅ Bot lancé avec succès !"))
    .catch((err) => {
        console.error("❌ Erreur lors du lancement :", err);
        process.exit(1);
    });

// ✅ Gestion des signaux d'arrêt proprement
process.once('SIGINT', () => {
    console.log("🛑 Bot arrêté (SIGINT)");
    bot.stop("SIGINT");
});
process.once('SIGTERM', () => {
    console.log("🛑 Bot arrêté (SIGTERM)");
    bot.stop("SIGTERM");
});
