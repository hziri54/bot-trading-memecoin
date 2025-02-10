require('dotenv').config();
const { Telegraf } = require('telegraf');

// Import des commandes
const priceCommand = require('./src/commands/price');
const createWalletCommand = require('./src/commands/createWallet');
const getWalletCommand = require('./src/commands/getWallet');
const deleteWalletCommand = require('./src/commands/deleteWallet');
const menuCommand = require('./src/commands/menu');
const buyCommand = require('./src/commands/buy');

// Vérifie si le token est chargé correctement
if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN est manquant dans le fichier .env !");
    process.exit(1);
}

// Initialise le bot
const bot = new Telegraf(process.env.BOT_TOKEN);

console.log("✅ Bot initialisé avec succès !");

// Gestion des erreurs globales
bot.catch((err, ctx) => {
    console.error(`❌ Erreur détectée pour l'utilisateur ${ctx.chat.id} :`, err);
    ctx.reply("⚠️ Une erreur est survenue. Réessayez plus tard.");
});

// Commande /start (Crée un wallet par défaut et affiche le solde)
bot.start(async (ctx) => {
    console.log("▶️ Commande /start reçue");

    await ctx.reply("🚀 *Bienvenue sur le bot de trading arcade !*\n\nChargement de votre wallet...", { parse_mode: 'Markdown' });

    try {
        // Vérifie si un wallet existe, sinon en crée un
        await createWalletCommand(ctx);
        // Affiche le solde immédiatement
        await getWalletCommand(ctx);
    } catch (err) {
        console.error("❌ Erreur lors du chargement du wallet :", err);
        ctx.reply("⚠️ Impossible de charger votre wallet.");
    }
});

// Commande /menu (Accéder au menu interactif)
bot.command('menu', (ctx) => {
    console.log("▶️ Commande /menu reçue");
    menuCommand(ctx);
});

// Commande /price (Voir le prix d'un token)
bot.command('price', (ctx) => {
    console.log("▶️ Commande /price reçue");
    try {
        priceCommand(ctx);
    } catch (err) {
        console.error("❌ Erreur dans la commande /price :", err);
        ctx.reply("⚠️ Une erreur est survenue. Réessayez plus tard.");
    }
});

// Commande /create_wallet (Crée un wallet si inexistant)
bot.command('create_wallet', (ctx) => {
    console.log("▶️ Commande /create_wallet reçue");
    try {
        createWalletCommand(ctx);
    } catch (err) {
        console.error("❌ Erreur dans la commande /create_wallet :", err);
        ctx.reply("⚠️ Impossible de créer le wallet. Réessayez plus tard.");
    }
});

// Commande /get_wallet (Affiche le wallet et le solde)
bot.command('get_wallet', async (ctx) => {
    console.log("▶️ Commande /get_wallet reçue");
    try {
        await getWalletCommand(ctx);
    } catch (err) {
        console.error("❌ Erreur dans la commande /get_wallet :", err);
        ctx.reply("⚠️ Impossible d'obtenir votre wallet. Réessayez plus tard.");
    }
});

// Commande /delete_wallet (Supprime le wallet de l'utilisateur)
bot.command('delete_wallet', (ctx) => {
    console.log("▶️ Commande /delete_wallet reçue");
    try {
        deleteWalletCommand(ctx);
    } catch (err) {
        console.error("❌ Erreur dans la commande /delete_wallet :", err);
        ctx.reply("⚠️ Impossible de supprimer le wallet. Réessayez plus tard.");
    }
});

// Commande /buy (Achat d'un token avec un montant en SOL)
bot.command('buy', (ctx) => {
    console.log("▶️ Commande /buy reçue");
    try {
        buyCommand(ctx);
    } catch (err) {
        console.error("❌ Erreur dans la commande /buy :", err);
        ctx.reply("⚠️ Une erreur est survenue. Réessayez plus tard.");
    }
});

// Gestion des actions pour le menu interactif
const actions = {
    buy: async (ctx) => await ctx.reply('🎯 *Buy menu coming soon!*', { parse_mode: 'Markdown' }),
    sell: async (ctx) => await ctx.reply('💥 *Sell menu coming soon!*', { parse_mode: 'Markdown' }),
    positions: async (ctx) => await ctx.reply('📊 *Here are your current positions!*', { parse_mode: 'Markdown' }),
    limit_orders: async (ctx) => await ctx.reply('📜 *Here are your limit orders!*', { parse_mode: 'Markdown' }),
    watchlist: async (ctx) => await ctx.reply('⭐ *Your watchlist is empty for now!*', { parse_mode: 'Markdown' }),
    settings: async (ctx) => await ctx.reply('⚙️ *Settings menu coming soon!*', { parse_mode: 'Markdown' }),
    refresh: async (ctx) => await ctx.reply('🔄 *Refreshing your data...*', { parse_mode: 'Markdown' }),
};

// Attache les actions aux boutons inline
Object.keys(actions).forEach((action) => {
    bot.action(action, actions[action]);
});

// Lancement du bot
bot.launch()
    .then(() => console.log("✅ Bot lancé avec succès !"))
    .catch((err) => {
        console.error("❌ Erreur lors du lancement :", err);
        process.exit(1);
    });

// Gestion des signaux d'arrêt proprement
process.once('SIGINT', () => {
    console.log("🛑 Bot arrêté (SIGINT)");
    bot.stop("SIGINT");
});
process.once('SIGTERM', () => {
    console.log("🛑 Bot arrêté (SIGTERM)");
    bot.stop("SIGTERM");
});
