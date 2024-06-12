const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const { getWalletData, parseTokenData, parseOverviewData, parseTransactionsData } = require("../../utils/mobula-util");

const fetchData = async (wallets) => {
  const publicKeys = wallets.split(',')
  const concatenatedWallets = wallets;
  // console.log(publicKeys);
  const response = await Promise.all([
    getWalletData(concatenatedWallets, "portfolio"),
    ...(publicKeys.map(async (address) =>
    ({
      'erc20': await getWalletData(address, "portfolio"),
    }),
    ))]);

  const overviewFetchedData = response[0];
  const fetchedData = response.slice(1, response.length);
  //   const dataOverview = await supabase.from("wallet_db").select("overview").eq("users",userID);
  // console.log(response)
  try {
    const walletData = [];
    const overview = {
      accounts: [],
      overview: {
        networth: overviewFetchedData.data.total_wallet_balance,
        realisedProfit: overviewFetchedData.data.total_realized_pnl,
        unrealisedProfit: overviewFetchedData.data.total_unrealized_pnl
      },
    };

    fetchedData.forEach((data) => {
      walletData.push(parseTokenData(data?.erc20?.data));
      overview.accounts.push(parseOverviewData(data?.erc20?.data));
    });

    const allocPercent = overviewFetchedData.data.assets.map((e) => ({ tokenName: e.asset.name, allocationPercent: e.allocation }));
    const tokensWithAllocation = allocPercent.filter(token => token.allocationPercent > 0);

    return {
      aggregatedErc20Data: overviewFetchedData?.data || {},
      walletData,
      overview,
      allocationPercent: tokensWithAllocation,
    };
  } catch (e) {
    return e;
  }
};

router.get("/wallet/:address", async (req, res) => {
  const wallets = req.params.address;
  try {
    if (!wallets || wallets.length <= 0) return res.status(400).send({ message: "Invalid wallets", error: "Invalid wallets" });

    const data = await fetchData(wallets);
    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    return res.status(404).send({ message: "not", error: e });
  }
});
module.exports = router;
