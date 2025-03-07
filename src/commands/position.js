const fs = require('fs');
const path = require('path');

// ✅ Vérifier l'évolution de la position de l'utilisateur
async function checkPosition(ctx) {
    const userId = ctx.chat.id;
    const positionPath = path.join(__dirname, '../../wallets', `${userId}_position.json`);

    if (!fs.existsSync(positionPath)) {
        return ctx.reply("📊 *Aucune position trouvée.* Vous devez acheter un token avant de consulter votre position.", { parse_mode: "Markdown" });
    }

    const positionData = JSON.parse(fs.readFileSync(positionPath, 'utf-8'));
    const { tokenAddress, buyPrice, solAmount } = positionData;

    // 🔄 Simuler une récupération du prix actuel du token (remplace FAKE_PRICE)
    const currentPrice = Math.random() * (buyPrice * 1.5 - buyPrice * 0.5) + buyPrice * 0.5; // Simule un prix entre -50% et +50%
    const pnlPercent = ((currentPrice - buyPrice) / buyPrice) * 100;
    const pnlValue = (pnlPercent / 100) * solAmount;

    let status = pnlPercent >= 0 ? "🟢 GAIN" : "🔴 PERTE";
    let message = `📊 *Évolution de votre position:*\n\n` +
        `🔹 *Token:* ${tokenAddress}\n` +
        `💸 *Investissement:* ${solAmount} SOL\n` +
        `💰 *Prix d'achat:* ${buyPrice} SOL/token\n` +
        `📈 *Prix actuel:* ${currentPrice.toFixed(6)} SOL/token\n\n` +
        `💹 *PNL:* ${pnlValue.toFixed(4)} SOL (*${pnlPercent.toFixed(2)}%*) - ${status}`;

    await ctx.reply(message, { parse_mode: "Markdown" });

    // 📌 Ajout du bouton vendre si le trade est positif
    if (pnlPercent > 0) {
        await ctx.reply("⚡ Vous pouvez vendre votre position :", {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [[{ text: "📤 Vendre", callback_data: `sell_${userId}` }]]
            }
        });
    }
}

module.exports = checkPosition;
