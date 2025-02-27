const { Markup } = require('telegraf');

async function menuCommand(ctx) {
    await ctx.reply(
        "⚡ *Menu Principal :*\n\n" +
        "📈 *Que souhaitez-vous faire ?*",
        Markup.inlineKeyboard([
            [Markup.button.callback("🛒 Acheter", "buy"), Markup.button.callback("💰 Vendre", "sell")],
            [Markup.button.callback("🔄 Refresh", "refresh"), Markup.button.callback("⚙️ Paramètres", "settings")],
            [Markup.button.callback("📊 Mes Positions", "positions")]
        ])
    );
}

module.exports = menuCommand;
