const { Markup } = require('telegraf');

async function sellToken(ctx) {
    console.log("▶️ Commande de vente reçue");

    await ctx.reply(
        "📉 *Vente de tokens* \n\n" +
        "🔹 Entrez l'adresse du token que vous souhaitez vendre :",
        Markup.forceReply()
    );

    ctx.session.awaitingSellAddress = true;
}

module.exports = sellToken;
