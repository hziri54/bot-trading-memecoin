require('dotenv').config();
const { Telegraf } = require('telegraf');
const priceCommand = require('./src/commands/price');

// Vérifie si le token est chargé correctement
if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN est manquant dans le fichier .env !");
    process.exit(1);
}

// Initialise le bot
const bot = new Telegraf(process.env.BOT_TOKEN);

console.log("✅ Bot initialisé avec succès !");

// Commande /start
bot.start((ctx) => {
    console.log("▶️ Commande /start reçue");
    ctx.reply("🚀 Bienvenue sur le bot de trading !");
});

// Commande /price
bot.command('price', (ctx) => {
    console.log(`▶️ Commande /price reçue avec l'argument : ${ctx.message.text}`);
    priceCommand(ctx);
});

// Lancement du bot
bot.launch()
    .then(() => console.log("✅ Krythos Bot lancé avec succès !"))
    .catch((err) => {
        console.error("❌ Erreur lors du lancement :", err);
        process.exit(1);
    });

// Gestion des signaux d'arrêt
process.once('SIGINT', () => {
    console.log("🛑 Bot arrêté (SIGINT)");
    bot.stop("SIGINT");
});
process.once('SIGTERM', () => {
    console.log("🛑 Bot arrêté (SIGTERM)");
    bot.stop("SIGTERM");
});
