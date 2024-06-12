const {calculateAllocationPercentage} =require('./parse-allocation-data');

const parseTokenData = async (data) => {
 const result = data.reduce((acc, item) => {
    item.breakdown.forEach((b) => {
      if (!acc[b.owner]) {
        acc[b.owner] = { tokens: [], totalTokenBalanceUSD: 0 };
      }
      const tokenBalanceUSD = Number(item.price.price) * Number(b.balance);
      acc[b.owner].tokens.push({
        name: item.name,
        symbol: item.symbol,
        balance: b.balance,
        chain: item.chain,
        logo: item.logo,
        address: item.contractAddress,
        price: item.price.price,
        totalTokenBalanceUSD: tokenBalanceUSD,
      });
      acc[b.owner].totalTokenBalanceUSD += tokenBalanceUSD;
    });
  
    return acc;
  }, {});
    const AddedAllocation = await calculateAllocationPercentage(result);
    return AddedAllocation;
  };

  module.exports = {parseTokenData};