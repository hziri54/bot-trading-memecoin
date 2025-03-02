const fs = require('fs');
const path = require('path');
const { PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const connection = require('../services/solana');
const { Markup } = require('telegraf');

const walletsDir = path.resolve(__dirname, '../wallets');

async function showWalletMenu(ctx) {
    try {
        const userId = ctx.chat.id;
        const walletPath = path.join(walletsDir, `${userId}.json`);

        if (!fs.existsSync(walletPath)) {
            return ctx.reply("⚠️ *Aucun wallet trouvé.* Utilisez `/bienvenue` pour créer un wallet.");
        }

        const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
        const publicKey = walletData.publicKey;
        const balance = await connection.getBalance(new PublicKey(publicKey));
        const solBalance = (balance / LAMPORTS_PER_SOL).toFixed(3);

        await ctx.reply(
            `💰 *Solana Wallet · 📈*\n\n` +
            `💼 *Adresse:* \`${publicKey}\`\n` +
            `💸 *Balance:* ${solBalance} SOL\n` +
            `—`,
            Markup.inlineKeyboard([
                [Markup.button.callback("📋 Copier Adresse", "copy_address")],
                [Markup.button.callback("🔄 Refresh", "refresh_balance")],
                [
                    Markup.button.callback("🛒 Acheter", "buy_token"),
                    Markup.button.callback("📉 Vendre", "sell_token")
                ],
                [Markup.button.callback("⚙️ Paramètres", "settings")]
            ])
        );
    } catch (error) {
        console.error("❌ Erreur lors de l'affichage du wallet :", error);
        ctx.reply("⚠️ Impossible d'afficher votre wallet.");
    }
}

module.exports = { showWalletMenu };
