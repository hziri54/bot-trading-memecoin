const { getRaydiumPrice } = require('../services/raydium');

const priceCommand = async (ctx) => {
    const args = ctx.message.text.split(" ");
    
    if (args.length < 2) {
        return ctx.reply("❌ Usage : /price [COIN/ADDRESS] (ex: /price BONK)");
    }

    const coinSymbol = args[1];
    let message = ""
    if(coinSymbol.length === 44)
        message = `🔍 Recherche du prix pour l'addresse ${coinSymbol}...`;
    else 
        message = `🔍 Recherche du prix pour le coin $${coinSymbol}...`;
    const searchMessage = await ctx.reply(message);
    
    const priceMessage = await getRaydiumPrice(coinSymbol);
    ctx.telegram.editMessageText(ctx.chat.id, searchMessage.message_id, null, priceMessage);
};

module.exports = priceCommand;
