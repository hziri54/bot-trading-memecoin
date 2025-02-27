const walletCommand = require('./wallet');

async function continuer(ctx) {
    console.log("▶️ Commande /continuer reçue");
    await walletCommand.showWalletMenu(ctx);
}

module.exports = continuer;
