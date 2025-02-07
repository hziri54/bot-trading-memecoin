console.log("✅ Le fichier bot.js a été chargé.");

const { Telegraf } = require('telegraf');
const priceCommand = require('./src/commands/price');

if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN est manquant dans le fichier .env !");
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("🚀 Bienvenue sur le bot de trading !"));
bot.command('price', priceCommand);

bot.launch()
    .then(() => console.log("✅ Krythos Bot lancé avec succès !"))
    .catch((err) => console.error("❌ Erreur lors du lancement :", err));
