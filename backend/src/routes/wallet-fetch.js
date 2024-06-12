const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const {
  getWalletData,
  parseNFTData,
  parseTokenData,
} = require("../utils/utils");

const mergeData = async (parsedToken, parsedNFT) => {
  return new Promise((resolve) => {
    const data = {};
    for (let key in parsedToken) {
      data[key] = {
        ...parsedToken[key],
        ...parsedNFT[key],
      };
    }

    resolve(data);
  });
};

const transformData = async (transactions, address) => {
  const datap = (transactions && transactions.length > 0) ? transactions.map((transaction) => ({
      hash: transaction.transaction_hash,
      type: transaction.type,
      chain: transaction.chain,
      value:transaction.detail.value,
      valueUSD: transaction.changes.length>0 ?  transaction.detail.value * transaction.changes[0].price.price : 0 ,
      from: transaction.detail.from,
      to: transaction.detail.to,
      tokenName: transaction.changes.length>0 ? transaction.changes[0].name: null,
      tokenSymbol: transaction.changes.length>0 ? transaction.changes[0].symbol: null,
      tokenIcon: transaction.changes.length>0 ? transaction.changes[0].logo :null,
      sendRecieve:
        transaction.detail.from.toLowerCase() === address.toLowerCase()
          ? "send"
          : "recieve",
    })): [];
  return datap;
};

const fetchData = async (wallets) => {
  try {
    const [token, nft, overview, history] = await Promise.all([
      getWalletData(wallets, "holding"),
      getWalletData(wallets, "nft-holding"),
      getWalletData(wallets, "overview"),
      getWalletData(wallets, "history"),
    ]);

    const parsedToken = await parseTokenData(token);
    const parsedNFT = await parseNFTData(nft);
let parseTransaction = null;
    if(history){
      parseTransaction = await transformData(history.data, wallets);
    }
    const data = await mergeData(parsedToken, parsedNFT);
    return { WalletData: data, overview: overview, history: parseTransaction };
  } catch (e) {
    console.log(e);
  }
};

router.get("/wallet/:walletAddress", async (req, res) => {
  const userID = req.params.walletAddress;
  try {
    const data = await fetchData(userID);
    return res.status(200).send(data);
  } catch (e) {
    return res.status(404).send({ message: "not", error: e });
  }
});
module.exports = router;
