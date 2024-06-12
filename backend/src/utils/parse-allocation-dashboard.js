const allocationPercent = async (data) => {
  const tokenBalances = {};

  let totalBalanceUSD = 0;
  Object.values(data).forEach(ownerData => {
    ownerData.tokens.forEach(token => {
      if (token.balance && token.price) {
        const tokenBalanceUSD = token.balance * token.price;
        totalBalanceUSD += tokenBalanceUSD;
        if (tokenBalances[token.name]) {
          tokenBalances[token.name] += tokenBalanceUSD;
        } else {
          tokenBalances[token.name] = tokenBalanceUSD;
        }
      }
    });
  });

  const allocationData = Object.entries(tokenBalances).map(([tokenName, tokenBalance]) => ({
    tokenName,
    allocationPercent: (tokenBalance / totalBalanceUSD) * 100
  }));

  return allocationData;
};



  module.exports = {allocationPercent};