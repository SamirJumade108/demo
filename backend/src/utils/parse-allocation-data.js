const calculateAllocationPercentage = async(data) => {
    const totalBalanceUSD = Object.values(data).reduce((total, ownerData) => {
      return total + ownerData.tokens.reduce((tokenTotal, token) => {
        return tokenTotal + (token.totalTokenBalanceUSD || 0);
      }, 0);
    }, 0);
  
    const allocationData = {};
    for (const owner in data) {
      allocationData[owner] = {
        tokens: data[owner].tokens.map(token => ({
          ...token,
          allocationPercentage: ((token.totalTokenBalanceUSD || 0) / totalBalanceUSD)*100
        })),
        totalTokenBalanceUSD: data[owner].totalTokenBalanceUSD
      };
    }
  
    return allocationData;
  };
  

module.exports = { calculateAllocationPercentage };
