const express = require("express");
const router = express.Router();

const { getWalletData } = require("../../utils/mobula-util");

router.get("/nft/:address", async (req, res) => {
  const address = req.params.address;

  try {
    if (!address || address.length <= 0) return res.status(400).send({ message: "Invalid address", error: "Invalid address" });

    const wallets = address.split(',');
    const resp = await Promise.all(
      wallets.map(async(address) =>( {transactions: await getWalletData(address,'nfts'), address })),
    );
    const formattedResponse = resp.map((txn) => ({
      address: txn?.address,
      nfts: txn?.transactions?.data || []
    }));    
    return res.status(200).send(formattedResponse);    return res.status(200).send(data);
  } catch (e) {
    return res.status(404).send({ message: "not found", error: e });
  }
});
module.exports = router;
