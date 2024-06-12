const parseUserWallets = (data) => {
    try {
        const result = [];
        const concatenatedWallets = [];
        if (data.wallets) {
            data.wallets.forEach((wallet) => {
                if (wallet.publicKey) {
                    result.push(wallet.publicKey);
                    concatenatedWallets.push(wallet.publicKey);
                }
            });
            if (concatenatedWallets.length > 0 && !result.includes(concatenatedWallets.join(','))) result.push(concatenatedWallets.join(','));
        }
        const concatenatedAuthWallets = [];
        if (data.authorized_wallets) {
            data.authorized_wallets.forEach((wallet) => {
                if (wallet.publicKey) {
                    result.push(wallet.publicKey);
                    concatenatedAuthWallets.push(wallet.publicKey);
                }
            });
            if (concatenatedAuthWallets.length > 0 && !result.includes(concatenatedAuthWallets.join(','))) result.push(concatenatedAuthWallets.join(','));
        }
        if (concatenatedWallets.length > 0 && concatenatedAuthWallets.length > 0) {
            const totalwallet = [...concatenatedWallets, ...concatenatedAuthWallets];
            result.push(totalwallet.join(','));
        }
        if (data.grouped_wallets) {

            data.grouped_wallets.forEach((group) => {
                const concatenatedWallets = [];
                if (group.wallets && group.wallets.length > 0) {
                    group.wallets.forEach((w) => {
                        if (w.publicKey && !result.includes(w.publicKey)) result.push(w.publicKey);
                        if (w.publicKey) concatenatedWallets.push(w.publicKey);
                    });
                }
                if (concatenatedWallets.length > 0 && !result.includes(concatenatedWallets.join(','))) result.push(concatenatedWallets.join(','));
            });
        }
        return result;
    } catch (e) {
        console.log(e);
        return [];
    }
};

module.exports = { parseUserWallets };
