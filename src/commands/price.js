const { getRaydiumPrice } = require('../services/raydium');

const priceCommand = async (ctx) => {
    const args = ctx.message.text.split(" ");
    
    if (args.length < 2) {
        return ctx.reply("❌ *Usage:* `/price [COIN/ADDRESS]` \n📌 Exemple: `/price BONK`", { parse_mode: "Markdown" });
    }

    const coinSymbol = args[1];
    let message = (coinSymbol.length === 44) 
        ? `🔍 *Recherche du prix pour l'adresse:* \`${coinSymbol}\` ...`
        : `🔍 *Recherche du prix pour le coin:* \`${coinSymbol.toUpperCase()}\` ...`;

    const searchMessage = await ctx.reply(message, { parse_mode: "Markdown" });

    const priceMessage = await getRaydiumPrice(coinSymbol);
    ctx.telegram.editMessageText(ctx.chat.id, searchMessage.message_id, null, priceMessage, { parse_mode: "Markdown" });
};

module.exports = priceCommand;
