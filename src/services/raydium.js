const axios = require('axios');

const getRaydiumPrice = async (coinSymbol) => {
    try {
        const url = `https://api.raydium.io/v2/main/pairs`;
        const response = await axios.get(url);
        
        // Rechercher le prix du memecoin demandé
        let pair;
        if(coinSymbol.length === 44) {
            pair = response.data.find(x => x.ammId === coinSymbol)
        } else {
            pair = response.data.find(p => p.name.split("/")[0] === coinSymbol.toUpperCase());
        }
        
        if (!pair) {
            return `❌ Coin $${coinSymbol} introuvable sur Raydium.`;
        }

        console.log(pair);

        return `💰 Prix actuel de $${pair.name} : ${pair.lpPrice} USD`;
    } catch (error) {
        console.error("Erreur API Raydium :", error);
        return "⚠️ Impossible de récupérer le prix.";
    }
};

module.exports = { getRaydiumPrice };
