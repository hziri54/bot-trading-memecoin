const axios = require('axios');

async function getTokenPrice(tokenAddress) {
    try {
        const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
        return response.data.pairs[0]?.priceUsd || null;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du prix du token:", error);
        return null;
    }
}

module.exports = { getTokenPrice };
