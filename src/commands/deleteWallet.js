const fs = require('fs');
const path = require('path');

const walletsDir = path.resolve(__dirname, '../../wallets');

const deleteWalletCommand = async (ctx) => {
    const walletPath = path.join(walletsDir, `${ctx.chat.id}.json`);

    // Vérifie si un wallet existe
    if (!fs.existsSync(walletPath)) {
        return ctx.reply("❌ Aucun wallet trouvé. Créez-en un avec `/create_wallet`.");
    }

    // Supprime le wallet
    fs.unlinkSync(walletPath);
    ctx.reply("✅ Votre wallet a été supprimé avec succès !");
};

module.exports = deleteWalletCommand;
