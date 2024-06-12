const axios = require("axios");
const path = require("path");
const { getObjectFromString } = require("./cache-helper");

const getWalletData = async (address, method, chains = '', useCache = true) => {
  try {
    console.log(`fecthing data for ${address} with method ${method}`);
    let url = `https://api.mobula.io/api/1/wallet/${method}`;
    // if (!chains) chains = 'Ethereum,Arbitrum,56,10,Polygon,Base,43114';

    const headers = {
      Authorization: process.env.MOBULA_API_KEY,
    };

    const key = address;
    const path = `${method}.json`;
    const cachePresent = useCache ? await getObjectFromString(key, path) : null;
    if (cachePresent) {
      return cachePresent;
    }

    if (method === 'portfolio') url += `?wallets=${address}&blockchains=${chains}&cache=true`;
    else if (method === 'nfts') url += `?wallet=${address}&blockchains=${chains}`;
    else if (method === 'history') url += `?wallets=${address}&blockchains=${chains}`;
    else if (method === 'transactions') url += `?wallet=${address}`

    const response = await axios.get(url, { headers});
    return response.data;
  } catch (erc20Data) {
    return erc20Data;
  }
};

const parseTokenData = (erc20Data, nftData, ownerAddress) => {
try {
    return ({
    address: erc20Data?.wallets?.length > 0 ? erc20Data.wallets[0] : ownerAddress,
    totalTokenBalanceUSD: erc20Data?.total_wallet_balance || '',
    tokens: erc20Data?.assets ? erc20Data.assets.map((e)=>({
      name: e.asset.name,
      symbol: e.asset.symbol,
      logo: e.asset.logo,
      price: e.price || e.price_bought,
      totalTokenBalanceUSD: e.estimated_balance,
      chain: e.contracts_balances[0].chainId || Object.keys(e.cross_chain_balances)[0],
      balance: e.token_balance,
      address: e.asset.contracts[0] || e.cross_chain_balances[Object.keys(e.cross_chain_balances)[0]].address,
      allocationPercentage: e.allocation
    })): [],
    totalNFTBalanceUSD: '',
    nfts: nftData && nftData.length > 0?
    nftData.map((nft)=>({
      ...(JSON.parse(nft.metadata)),
      name: nft.name,
      chain: nft.blockchain,
      floorPrice: '',
      nftPrice: '',
      tokenId: nft.token_id,
      address: '',
      price: '',
    })): []
    });
}catch(e) {
  console.log(e);
  return e;
}
};

const parseOverviewData = (erc20Data) =>{
  try {
    return ({
      address: erc20Data?.wallets ? erc20Data.wallets[0] : null,
      value: erc20Data?.total_wallet_balance || null,
      realisedProfit: erc20Data?.total_realized_pnl || null,
      unrealisedProfit: erc20Data?.total_unrealized_pnl || null
    })
}catch(e) {
  console.log(e);
  return e;
} 
}
const parseTransactionsData = (transactionsData, erc20Data) =>{
  try {
    return ({
      address: erc20Data.wallets[0],
      history: transactionsData?.transactions || []
    })
}catch(e) {
  // console.log(e);
  return e;
} 
}

module.exports = { getWalletData , parseTokenData,parseOverviewData, parseTransactionsData};
