const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const getWalletCommand = async (ctx) => {
    const userId = ctx.chat.id;
    const walletPath = path.join(__dirname, `../../wallets/${userId}.json`);

    // Vérifier si le wallet existe
    if (!fs.existsSync(walletPath)) {
        return ctx.reply("❌ Aucun wallet trouvé. Créez-en un avec `/create_wallet`.");
    }

    // Charger les données du wallet
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const publicKey = new PublicKey(walletData.publicKey);

    // Connexion à Solana
    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

    try {
        // Récupérer le solde du wallet
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSOL = balanceLamports / 1e9; // Convertir en SOL

        ctx.reply(`💼 *Wallet par défaut :*\n\n📥 *Adresse publique:* \`${walletData.publicKey}\`\n💰 *Solde:* \`${balanceSOL.toFixed(4)} SOL\``, {
            parse_mode: 'Markdown'
        });
    } catch (err) {
        console.error("❌ Erreur lors de la récupération du solde :", err);
        ctx.reply("❌ Impossible d'obtenir votre solde pour le moment. Réessayez plus tard.");
    }
};

module.exports = getWalletCommand;
