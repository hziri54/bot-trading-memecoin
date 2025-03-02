require('dotenv').config();
const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');
const { PublicKey, Connection } = require('@solana/web3.js');
const {
    acheterCommand,
    handleTokenAddress,
    handleInvestmentAmount,
    confirmAcheter,
    cancelAcheter
} = require('./src/commands/acheter');

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

const bienvenueCommand = require("./src/commands/bienvenue");
bot.command("bienvenue", bienvenueCommand);

// ✅ Commande Continuer (Affichage du menu principal)
bot.command('continuer', async (ctx) => {
    const userId = ctx.chat.id;
    const walletPath = `./wallets/${userId}.json`;

    if (!fs.existsSync(walletPath)) {
        return ctx.reply("❌ *Aucun wallet trouvé.* Utilisez `/bienvenue` pour en créer un.");
    }

    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const publicKey = new PublicKey(walletData.publicKey);

    // Récupérer le solde
    const balance = await connection.getBalance(publicKey);
    const solBalance = (balance / 1e9).toFixed(4);
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

// ✅ Copier la clé privée
bot.action(/^copy_private_(\d+)$/, async (ctx) => {
    const userId = ctx.match[1];
    const walletPath = `./wallets/${userId}.json`;

    if (!fs.existsSync(walletPath)) {
        return ctx.reply("❌ *Aucun wallet trouvé.*");
    }

    const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
    if (!walletData.privateKey) {
        return ctx.reply("🛑 *La clé privée a déjà été supprimée.*");
    }

    await ctx.reply(`📋 *Clé privée copiée:* \`${walletData.privateKey}\``, { parse_mode: "Markdown" });
});

// ✅ Bouton Refresh pour mettre à jour le solde
bot.action('refresh_solde', async (ctx) => {
    const userId = ctx.chat.id;
    const walletPath = `./wallets/${userId}.json`;

    if (!fs.existsSync(walletPath)) {
        return ctx.reply("❌ *Aucun wallet trouvé.* Utilisez `/bienvenue` pour en créer un.");
    }

    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const publicKey = new PublicKey(walletData.publicKey);

    // ✅ Mise à jour du solde
    const balance = await connection.getBalance(publicKey);
    const solBalance = (balance / 1e9).toFixed(4);

    await ctx.editMessageText(
        `💰 *Solana Wallet · 📈*\n\n` +
        `💼 *Adresse:* \`${walletData.publicKey}\`\n\n` +
        `💸 *Solde:* ${solBalance} SOL\n\n` +
        `🔄 Cliquez sur *Refresh* pour mettre à jour le solde.`,
        Markup.inlineKeyboard([
            [Markup.button.callback("🔄 Refresh", "refresh_solde")],
            [Markup.button.callback("🛒 Acheter", "acheter")],
            [Markup.button.callback("📤 Vendre", "vendre")],
            [Markup.button.callback("⚙️ Paramètres", "settings")]
        ]),
        { parse_mode: 'Markdown' }
    );
});


    await ctx.reply(
        `💰 *Solana Wallet · 📈*\n\n` +
        `💼 *Adresse:* \`${walletData.publicKey}\`\n\n` +
        `💸 *Solde:* ${solBalance} SOL\n\n` +
        `🔄 Cliquez sur *Refresh* pour mettre à jour le solde.`,
        Markup.inlineKeyboard([
            [Markup.button.callback("🔄 Refresh", "refresh_solde")],
            [Markup.button.callback("🛒 Acheter", "acheter")],
            [Markup.button.callback("📤 Vendre", "vendre")],
            [Markup.button.callback("⚙️ Paramètres", "settings")]
        ]),
        { parse_mode: 'Markdown' }
    );
});

// ✅ Action du bouton Acheter (Lancer la commande acheter)
bot.action('acheter', async (ctx) => {
    await acheterCommand(ctx);
});

// ✅ Écoute des messages utilisateur
bot.on('text', async (ctx) => {
    const userId = ctx.chat.id;

    if (acheterSessions[userId]) {
        console.log(`🔄 [DEBUG] Message reçu en session d'achat : ${ctx.message.text}`);

        if (acheterSessions[userId].step === 1) {
            return await handleTokenAddress(ctx, acheterSessions);
        }
        if (acheterSessions[userId].step === 2) {
            return await handleInvestmentAmount(ctx, acheterSessions);
        }
    }
});

// ✅ Gestion des confirmations et annulations
bot.action(/^confirm_acheter_(\d+)$/, (ctx) => confirmAcheter(ctx));
bot.action(/^cancel_acheter_(\d+)$/, (ctx) => cancelAcheter(ctx));

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
