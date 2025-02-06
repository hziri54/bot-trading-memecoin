require('dotenv').config();
const { Telegraf } = require('telegraf');

// Vérifie si BOT_TOKEN est bien défini
if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN manquant dans .env !");
    process.exit(1);
}

// Crée le bot avec le token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Commande /start
bot.start((ctx) => {
    ctx.reply("Bienvenue sur Krythos Bot ! 🚀\nUtilise /buy pour acheter un memecoin.");
});

// Commande /buy
bot.command('buy', (ctx) => {
    ctx.reply("🛒 Achat en cours... (simulation)");
});

// Commande /price
bot.command('price', require('./commands/price'));


// Lancer le bot
bot.launch()
    .then(() => console.log("✅ Krythos Bot est en ligne sur Telegram !"))
    .catch(err => console.error("❌ Erreur de lancement :", err));

// Gestion des erreurs
process.on('uncaughtException', (err) => {
    console.error("⚠️ Erreur non gérée :", err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("⚠️ Rejet non géré :", reason);
});
