const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');

const walletsDir = path.resolve(__dirname, '../../wallets');
if (!fs.existsSync(walletsDir)) {
    fs.mkdirSync(walletsDir);
}

async function bienvenueCommand(ctx) {
    const userId = ctx.chat.id;
    const walletPath = path.join(walletsDir, `${userId}.json`);

    // ✅ Vérifie si l'utilisateur a déjà un wallet
    if (fs.existsSync(walletPath)) {
        const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
        return ctx.reply(
            `💰 *Solana Wallet* · 📈\n\n` +
            `💼 *Adresse:* \n\`${walletData.publicKey}\`\n\n` +  // 🔥 Copiable en un clic
            `💳 *Balance:* 🔄 Vérification en cours...\n` +
            `—`,
            { parse_mode: 'Markdown' }
        );
    }

    // ✅ Génère un nouveau wallet pour l'utilisateur
    const keypair = Keypair.generate();
    const privateKeyHex = Buffer.from(keypair.secretKey).toString('hex');

    const walletData = {
        publicKey: keypair.publicKey.toString(),
        privateKeyHex: privateKeyHex
    };

    fs.writeFileSync(walletPath, JSON.stringify(walletData, null, 2));

    // ✅ Envoie le message avec les données copiable en 1 clic
    await ctx.reply(
        `✅ *Bienvenue ! Votre wallet a été généré !*\n\n` +
        `💼 *Adresse:* \n\`${walletData.publicKey}\`\n\n` +  // 🔥 Copiable en un clic
        `🔑 *Clé privée (disparaît sous 1 min) :*\n\`${walletData.privateKeyHex}\`\n\n` +  // 🔥 Copiable en un clic
        `⚠️ *Sauvegardez votre clé privée immédiatement !*\n` +
        `Elle sera supprimée pour des raisons de sécurité.\n`,
        { parse_mode: 'Markdown' }
    );

    // ✅ Suppression automatique de la clé privée après 1 minute
    setTimeout(() => {
        if (fs.existsSync(walletPath)) {
            const savedWallet = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
            fs.writeFileSync(walletPath, JSON.stringify({ publicKey: savedWallet.publicKey }, null, 2));
            ctx.reply("🛑 *Votre clé privée a été supprimée pour des raisons de sécurité.*", { parse_mode: 'Markdown' });
        }
    }, 60 * 1000);
}

module.exports = { bienvenueCommand };
