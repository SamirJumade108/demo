
const { createPublicClient, http } = require('viem');
const { mainnet} = require('viem/chains');
const { supabase } = require('./utils/supabase');
const statstoken = require('../src/config/tokenABI.json')


const NodeCache = require('node-cache');
const cron = require('node-cron');

const cache = new NodeCache();

const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
});

async function updateWalletBalances() {
    const { data: wallets, error } = await supabase.from('auth').select('*');
  
    if (error) {
      console.error('Error fetching wallets:', error);
      return;
    }
    for (const wallet of wallets) {
      if (!wallet.wallet) {
        return;
      }
      const balance = await checkTokenBalance(wallet.wallet);
      cache.set(wallet.wallet, balance, 3600);
      const { data, error } = await supabase
        .from('auth')
        .update({ balance: balance })
        .eq('wallet', wallet.wallet);
        if (error) {
            console.error('Error updating wallet balance:', error);
            return;
            }

    }
  }

  async function checkTokenBalance(address) {
    const balances= await publicClient.readContract({
      address: statstoken.address,
      abi: statstoken.abi,
      functionName: "balanceOf",
      args: [address],
    });
    if (balances===undefined) {  
      console.error("Error fetching token balance:", error);
      return 0;
    }
  
    return Number(formatUnits(balances,9));
  }

async function updateCache() {
    const { data, error } = await supabase
      .from('auth')
      .select('*');
  
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    cache.set('auth', data);
  }

const runWorker = async () => {
    await updateWalletBalances();
    cron.schedule('*/5 * * * *', updateCache);
        try {
            console.log('Watching for new blocks...');

            publicClient.watchContractEvent({
                address: statstoken.address,
                abi: statstoken.abi,
                event: 'Transfer',
                onLogs: async (logs) => {
                    if(logs.length > 0){
                      logs.forEach(async (log) => {
                        if(log.args.from === undefined){
                          return;
                        }
                          prev_balance = cache.get(log?.args?.from);
                            if(prev_balance===undefined){
                                return;
                            }
                            const balance = await checkTokenBalance(log?.args?.from);
                            cache.set(log?.args?.from, balance, 3600);
                            const { data, error } = await supabase
                            .from('auth')
                            .update({ balance: balance })
                            .eq('wallet', log?.args?.from);
                            if (error) {
                                console.error('Error updating wallet balance:', error);
                                return;
                            }
                        });
                    }
                },
            }, 
);
            
        } catch (error) {
            console.error('Error updating wallet balances:', error);
        }
    }
runWorker();