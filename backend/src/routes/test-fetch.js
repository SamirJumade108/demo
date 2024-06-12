const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
const { getWallets, getWalletDataTest } = require("./../utils/utils");

const fetchData = async (wallets) => {
  const publicKeys = wallets.map((wallet) => wallet.publicKey);

  const [token, nft, transactions, history] = await Promise.all([
    getWalletDataTest(publicKeys, "portfolio"),
    getWalletDataTest(publicKeys, "nft"),
    getWalletDataTest(publicKeys, "transactions"),
    getWalletDataTest(publicKeys, "history"),
  ]);

  // try {
  //   const parsedToken = await parseTokenData(token);
  //   const allocationPercent1 = await allocationPercent(parsedToken);
  //   const parsedNFT = await parseNFTData(nft);
  //   const data = await mergeData(parsedToken, parsedNFT);
  //   return {
  //     WalletData: data,
  //     overview: overview,
  //     allocationPercent: allocationPercent1,
  //   };
  // } catch (e) {
  //   return e;
  // }
  return {
    tokens: token,
    nft: nft,
    transactions: transactions,
    history: history,
  };
};

router.get("/test/:userID", async (req, res) => {
  const userID = req.params.userID;
  try {
    const wallets = await getWallets(userID, "wallets");
    const data = await fetchData(wallets);
    return res.status(200).send(data);
  } catch (e) {
    return res.status(404).send({ message: "not", error: e });
  }
});
module.exports = router;
