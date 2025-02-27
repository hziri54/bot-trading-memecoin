const fs = require('fs');
const path = require('path');

async function getWallet(ctx) {
    console.log("▶️ Commande /continuer reçue pour afficher le wallet");

    const userId = ctx.chat.id;
    const walletsDir = './wallets';
    const walletPath = path.join(walletsDir, `${userId}.json`);

    if (!fs.existsSync(walletPath)) {
        console.error(`⚠️ Wallet introuvable pour ${userId}, création d'un nouveau wallet...`);
        await createWallet(ctx);
    }
    

    try {
        const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));

        if (!walletData.publicKey) {
            console.error(`❌ Clé publique manquante dans le fichier du wallet ${userId}`);
            return ctx.reply("⚠️ Erreur : Wallet corrompu. Veuillez régénérer un wallet avec /commencer.");
        }

        await ctx.reply(
            `💰 *Solana Wallet · 📈*\n\n` +
            `💼 *Adresse:* \`${walletData.publicKey}\`\n` +
            `💸 *Balance:* N/A SOL\n` +
            `—`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📋 Copier Adresse", callback_data: "copy_address" }],
                        [{ text: "🔄 Refresh", callback_data: "refresh_balance" }],
                        [{ text: "🛒 Acheter", callback_data: "buy" }, { text: "📉 Vendre", callback_data: "sell" }],
                        [{ text: "📊 Positions", callback_data: "positions" }, { text: "📜 Ordres", callback_data: "orders" }],
                        [{ text: "⚙️ Paramètres", callback_data: "settings" }]
                    ]
                }
            }
        );
    } catch (err) {
        console.error("❌ Erreur de lecture du wallet :", err);
        return ctx.reply("⚠️ Erreur : Impossible de lire votre wallet. Essayez de le régénérer avec /commencer.");
    }
}

module.exports = getWallet;
