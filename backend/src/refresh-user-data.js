
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
const { createClient } = require("@supabase/supabase-js");
const { parseUserWallets } = require("./utils/parse-user-wallet");
const { getWalletData } = require("./utils/mobula-util");
const { storeDataToFileStorage } = require("./utils/cache-helper");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

module.exports = async () => {
    try {
        let offset = 0;
        const batchSize = 5;
        const { data, error } = await supabase
        .from("wallet_db")
        .select("id");
    
        let totalEntries = data.length;
        let remainingEntries = data.length;
        
        while (true) {

            const currentBatchSize = Math.min(batchSize, remainingEntries);
            
            const { data, error } = await supabase
                .from('wallet_db')
                .select('*')
                .range(offset, offset + currentBatchSize - 1);
    
            if (error) {
                console.error('Error fetching data:', error.message);
                break;
            }

            if (data && data.length > 0) {

                await Promise.all(
                    data.map(async (user) => {
                        const userWallets = parseUserWallets(user);
                        const walletData = await Promise.all(
                            userWallets.map(async(wallet) => ({
                                key: wallet,
                                portfolio: await getWalletData(wallet, 'portfolio', '', false),
                                nfts: wallet.length <= 45 ? await getWalletData(wallet, 'nfts', '', false) : null,
                                history: await getWalletData(wallet, 'history', '', false),
                                transactions: wallet.length <= 45 ? await getWalletData(wallet, 'transactions', '', false) : null,
                            })),
                        );

                        if (walletData?.length > 0)
                        walletData.forEach((e)=> {
                            // filter out the zero values
                            if (e?.portfolio?.data?.assets)
                                e.portfolio.data.assets = e.portfolio.data.assets.filter((e)=> e.estimated_balance ? e.estimated_balance > 0 : false);
                            if (e.portfolio?.data) storeDataToFileStorage(e.key, e.portfolio, 'portfolio.json')
                            if (e.nfts?.data) storeDataToFileStorage(e.key, e.nfts, 'nfts.json')
                            if (e.history?.data?.wallet !== '0x') storeDataToFileStorage(e.key, e.history, 'history.json')
                            if (e.transactions?.data) storeDataToFileStorage(e.key, e.transactions, 'transactions.json')
                        });

                        return {
                            id: user.id,
                        }
                    })
                )
    
                // Update remaining entries
                remainingEntries -= currentBatchSize;
    
                // Update offset for next batch
                offset += currentBatchSize;
            } else {
                // No more data available, break out of the loop
                break;
            }
    
            // If all entries have been processed, reset offset for next iteration
            if (remainingEntries <= 0) {
                offset = 0;
                remainingEntries = totalEntries;
            }
        }
    } catch (error) {
        console.log(error);
    }
};
