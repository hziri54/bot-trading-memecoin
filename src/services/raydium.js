const axios = require('axios');

const getRaydiumPrice = async (coinSymbol) => {
    try {
        const url = `https://api.raydium.io/v2/main/pairs`;
        const response = await axios.get(url, { timeout: 5000 }); // Timeout de 5s

        // Recherche du prix
        let pair;
        if(coinSymbol.length === 44) {
            pair = response.data.find(x => x.ammId === coinSymbol);
        } else {
            pair = response.data.find(p => p.name.split("/")[0] === coinSymbol.toUpperCase());
        }

        if (!pair) {
            return `❌ Coin $${coinSymbol} introuvable sur Raydium.`;
        }

        return `💰 Prix actuel de $${pair.name} : ${pair.lpPrice} USD`;
    } catch (error) {
        console.error("Erreur API Raydium :", error.message || error);
        return "⚠️ Impossible de récupérer le prix. Réessaie plus tard.";
    }
};

module.exports = { getRaydiumPrice };
