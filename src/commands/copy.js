async function copyAddress(ctx) {
    console.log("▶️ Commande copier l'adresse reçue");

    const userId = ctx.chat.id;
    const walletsDir = './wallets';
    const fs = require('fs');
    const path = require('path');

    const walletPath = path.join(walletsDir, `${userId}.json`);

    if (fs.existsSync(walletPath)) {
        const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));

        if (walletData.publicKey) {
            await ctx.reply(
                `✅ *Adresse copiée !*\n\n` +
                `💼 *Adresse:* \`${walletData.publicKey}\`\n\n` +
                `Appuyez sur l'adresse pour la copier !`,
                { parse_mode: 'Markdown' }
            );
        } else {
            await ctx.reply("⚠️ Adresse introuvable. Veuillez générer un wallet.");
        }
    } else {
        await ctx.reply("⚠️ Aucun wallet trouvé. Utilisez `/commencer` pour générer un wallet.");
    }
}

module.exports = copyAddress;
