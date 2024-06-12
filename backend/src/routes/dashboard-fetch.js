const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
const {
  getWalletData,
  getWallets,
  parseNFTData,
  parseTokenData,
  allocationPercent,
} = require("../utils/utils");
const { supabase } = require("../utils/supabase");

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

const fetchData = async (wallets,userID) => {
  const publicKeys = wallets.map((wallet) => wallet.publicKey);

  const [token, nft, overview] = await Promise.all([
    getWalletData(publicKeys, "holding"),
    getWalletData(publicKeys, "nft-holding"),
    getWalletData(publicKeys, "overview"),
  ]);
  const dataOverview = await supabase.from("wallet_db").select("overview").eq("users",userID);

  try {
    const parsedToken = await parseTokenData(token);
    const allocationPercent1 = await allocationPercent(parsedToken);
    const parsedNFT = await parseNFTData(nft);
    const data = await mergeData(parsedToken, parsedNFT);
    return {
      WalletData: data,
      overview: overview,
      allocationPercent: allocationPercent1,
      dataOverview:dataOverview.data[0].overview,
    };
  } catch (e) {
    return e;
  }
};

router.get("/dashboard/:userID", async (req, res) => {
  const userID = req.params.userID;
  try {
    const wallets = await getWallets(userID, "wallets");
    const data = await fetchData(wallets,userID);
    return res.status(200).send(data);
  } catch (e) {
    return res.status(404).send({ message: "not", error: e });
  }
});
module.exports = router;
