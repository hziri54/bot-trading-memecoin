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

// ✅ Commande Bienvenue (Première connexion)
bot.command('bienvenue', async (ctx) => {
    const userId = ctx.chat.id;
    const walletPath = `./wallets/${userId}.json`;

    if (!fs.existsSync(walletPath)) {
        console.log(`🔄 Génération du wallet pour ${userId}...`);
        
        // Création d'un wallet
        const keypair = require('@solana/web3.js').Keypair.generate();
        const walletData = {
            publicKey: keypair.publicKey.toString(),
            privateKey: Buffer.from(keypair.secretKey).toString('hex')
        };

        fs.writeFileSync(walletPath, JSON.stringify(walletData, null, 2));
        console.log(`✅ Wallet créé pour ${userId} : ${walletData.publicKey}`);

        await ctx.reply(
            `✅ *Votre wallet a été généré !*\n\n` +
            `💼 *Adresse:* \`${walletData.publicKey}\`\n\n` +
            `🔑 *Clé privée (disparaît dans 1 min) :*\n\`${walletData.privateKey}\`\n\n` +
            `⚠️ *Sauvegardez immédiatement votre clé privée.* Elle sera supprimée pour la sécurité.`,
            Markup.inlineKeyboard([Markup.button.callback("✅ Continuer", "continuer_menu")]),
            { parse_mode: 'Markdown' }
        );

        setTimeout(() => {
            if (fs.existsSync(walletPath)) {
                fs.writeFileSync(walletPath, JSON.stringify({ publicKey: walletData.publicKey }, null, 2));
                ctx.reply("🛑 *Votre clé privée a été supprimée pour des raisons de sécurité.*", { parse_mode: 'Markdown' });
            }
        }, 60000);
    } else {
        await ctx.reply("🛑 *Vous avez déjà un wallet !* Utilisez `/continuer` pour accéder au menu.");
    }
});

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

// ✅ Action du bouton Refresh (Mise à jour du solde)
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
            [Markup.button.callback("🔄 Refresh", "refresh_solde")],
            [Markup.button.callback("🛒 Acheter", "acheter")],
            [Markup.button.callback("📤 Vendre", "vendre")],
            [Markup.button.callback("⚙️ Paramètres", "settings")]
        ]),
        { parse_mode: 'Markdown' }
    );
});

// ✅ Action du bouton Acheter (Lancer la commande acheter)
bot.action('acheter', async (ctx) => acheterCommand(ctx));

// ✅ Gestion des messages pour l'achat (étapes)
bot.on('text', async (ctx) => {
    const userId = ctx.chat.id;
    if (acheterSessions[userId]) {
        if (acheterSessions[userId].step === 1) return handleTokenAddress(ctx, acheterSessions);
        if (acheterSessions[userId].step === 2) return handleInvestmentAmount(ctx, acheterSessions);
    }
});

// ✅ Gestion des actions pour confirmer/annuler l'achat
bot.action(/^confirm_acheter_(\d+)$/, (ctx) => confirmAcheter(ctx, acheterSessions));
bot.action(/^cancel_acheter_(\d+)$/, (ctx) => cancelAcheter(ctx, acheterSessions));

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
