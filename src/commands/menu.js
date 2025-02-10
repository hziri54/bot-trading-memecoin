const menuCommand = async (ctx) => {
    const arcadeHeader = `🎮 *Arcade Trading Bot*\n\n` +
        `💼 *Wallet Address:* \`YourWalletAddressHere\`\n` +
        `💰 *Balance:* \`0.769 SOL ($157.32)\`\n` +
        `🚀 _Welcome to the arcade-style trading bot!_\n`;

    const arcadeFooter = `🔄 Click on a button below to start trading or manage your account.\n`;

    await ctx.reply(arcadeHeader, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                // Row 1: Buy & Sell
                [
                    { text: '🎯 Buy', callback_data: 'buy' },
                    { text: '💥 Sell', callback_data: 'sell' }
                ],
                // Row 2: Positions & Orders
                [
                    { text: '📊 Positions', callback_data: 'positions' },
                    { text: '📜 Limit Orders', callback_data: 'limit_orders' }
                ],
                // Row 3: Watchlist & Settings
                [
                    { text: '⭐ Watchlist', callback_data: 'watchlist' },
                    { text: '⚙️ Settings', callback_data: 'settings' }
                ],
                // Row 4: Refresh
                [
                    { text: '🔄 Refresh', callback_data: 'refresh' }
                ]
            ]
        }
    });

    await ctx.reply(arcadeFooter, {
        parse_mode: 'Markdown'
    });
};

module.exports = menuCommand;
