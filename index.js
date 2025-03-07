require('dotenv').config();
const fs = require('fs');
const { Telegraf, Markup } = require('telegraf');
const { PublicKey, Connection } = require('@solana/web3.js');
const { startBuyingProcess, handleTokenAddress, handleInvestmentAmount, confirmAcheter, cancelAcheter } = require('./src/commands/acheter');
const bienvenueCommand = require("./src/commands/bienvenue");
const { addSession, getSession, deleteSession } = require("./src/utils/sessionManager");

const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN est manquant !");
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
console.log("✅ Bot lancé avec succès !");

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

// ✅ Lancer l'achat
bot.action('acheter', async (ctx) => {
    await startBuyingProcess(ctx);
});

// ✅ Écoute des messages utilisateur pour l'achat (Adresse & Montant)
bot.on('text', async (ctx) => {
    const userId = ctx.chat.id;
    const message = ctx.message.text.trim();

    console.log(`🔄 [DEBUG] Message reçu de ${userId}: ${message}`);

    const session = getSession(userId);
    if (session) {
        console.log(`🟡 [DEBUG] Session trouvée pour ${userId}. Étape: ${session.step}`);

        if (session.step === 1) {
            return await handleTokenAddress(ctx);
        }
        if (session.step === 2) {
            return await handleInvestmentAmount(ctx);
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

// ✅ Lancement du bot
bot.launch()
    .then(() => console.log("✅ Bot lancé avec succès !"))
    .catch((err) => {
        console.error("❌ Erreur lors du lancement :", err);
        process.exit(1);
    });

// ✅ Gestion des signaux d'arrêt proprement
process.once('SIGINT', () => bot.stop("SIGINT"));
process.once('SIGTERM', () => bot.stop("SIGTERM"));
