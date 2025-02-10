const { Connection, Keypair, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const buyCommand = async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("❌ Usage : /buy [TOKEN] [AMOUNT_IN_SOL]\nExemple : /buy BONK 0.5");
    }

    const token = args[1].toUpperCase(); // Exemple : BONK
    const amountInSOL = parseFloat(args[2]); // Montant en SOL

    if (isNaN(amountInSOL) || amountInSOL <= 0) {
        return ctx.reply("❌ Le montant doit être un nombre valide supérieur à 0.");
    }

    // Charger la clé privée de l'utilisateur depuis le fichier JSON
    const userId = ctx.chat.id;
    const walletPath = path.join(__dirname, `../../wallets/${userId}.json`);

    if (!fs.existsSync(walletPath)) {
        return ctx.reply("❌ Aucun wallet trouvé. Créez-en un avec `/create_wallet`.");
    }

    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const userKeypair = Keypair.fromSecretKey(Uint8Array.from(Buffer.from(walletData.secretKey, 'hex')));

    // Connexion à la blockchain Solana
    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

    try {
        // Simulation d'achat : transfert de SOL vers une adresse de pool
        const poolAddress = new PublicKey('DestinationWalletAddressHere'); // Remplace par une adresse valide (par ex., un DEX ou une pool)
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: userKeypair.publicKey,
                toPubkey: poolAddress,
                lamports: amountInSOL * 1e9, // Conversion SOL → lamports (1 SOL = 10^9 lamports)
            })
        );

        // Signer et envoyer la transaction
        const signature = await connection.sendTransaction(transaction, [userKeypair]);
        await connection.confirmTransaction(signature, 'confirmed');

        // Réponse au succès
        ctx.reply(`✅ Achat de ${amountInSOL} SOL pour ${token} effectué avec succès !\n` +
            `🔗 [Explorer la transaction](https://explorer.solana.com/tx/${signature})`, {
            parse_mode: 'Markdown',
        });
    } catch (err) {
        console.error("❌ Erreur lors de l'achat :", err);
        ctx.reply("❌ Une erreur est survenue lors de l'achat. Vérifiez votre solde ou réessayez plus tard.");
    }
};

module.exports = buyCommand;
