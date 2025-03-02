
const fs = require("fs");
const { Keypair, PublicKey, Connection } = require("@solana/web3.js");
const { Markup } = require("telegraf");

const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

const walletsDir = "./wallets";
if (!fs.existsSync(walletsDir)) {
    fs.mkdirSync(walletsDir);
}

async function bienvenueCommand(ctx) {
    const userId = ctx.chat.id;
    const walletPath = `${walletsDir}/${userId}.json`;

    if (!fs.existsSync(walletPath)) {
        console.log(`🔄 Génération du wallet pour ${userId}...`);

        // ✅ Génération du wallet Solana
        const keypair = Keypair.generate();
        const walletData = {
            publicKey: keypair.publicKey.toString(),
            privateKey: Buffer.from(keypair.secretKey).toString("hex"),
        };

        // ✅ Stockage du wallet
        fs.writeFileSync(walletPath, JSON.stringify(walletData, null, 2));
        console.log(`✅ Wallet créé pour ${userId} : ${walletData.publicKey}`);

        // ✅ Récupérer le solde initial
        const publicKey = new PublicKey(walletData.publicKey);
        const balance = await connection.getBalance(publicKey);
        const solBalance = (balance / 1e9).toFixed(4);

        // ✅ Affichage du wallet avec boutons pour copier
        await ctx.reply(
            `✅ *Bienvenue sur le bot !*\n\n` +
            `💼 *Adresse du wallet:* \`${walletData.publicKey}\`\n\n` +
            `🔑 *Clé privée (disparaît dans 1 min) :*\n\`${walletData.privateKey}\`\n\n` +
            `💰 *Solde actuel:* ${solBalance} SOL\n\n` +
            `⚠️ *Sauvegardez immédiatement votre clé privée.* Elle sera supprimée pour la sécurité.`,
            Markup.inlineKeyboard([
                [Markup.button.callback("📋 Copier l'adresse", `copy_address_${userId}`)],
                [Markup.button.callback("📋 Copier la clé privée", `copy_private_${userId}`)],
                [Markup.button.callback("✅ Continuer", "continuer_menu")]
            ]),
            { parse_mode: "Markdown" }
        );

        // ✅ Suppression de la clé privée après 1 minute
        setTimeout(() => {
            if (fs.existsSync(walletPath)) {
                const savedWallet = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
                fs.writeFileSync(walletPath, JSON.stringify({ publicKey: savedWallet.publicKey }, null, 2));
                console.log(`🛑 Clé privée supprimée pour ${userId}`);
                ctx.reply("🛑 *Votre clé privée a été supprimée pour des raisons de sécurité.*", { parse_mode: "Markdown" });
            }
        }, 60000);
    } else {
        await ctx.reply("🛑 *Vous avez déjà un wallet !* Utilisez `/continuer` pour accéder au menu.");
    }
}

module.exports = bienvenueCommand;
