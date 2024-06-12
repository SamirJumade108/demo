const express = require("express");
const router = express.Router();

const { getWalletData } = require("../../utils/mobula-util");

router.get("/transactions/:address", async (req, res) => {
  const addresses = req.params.address;

  try {
    if (!addresses || addresses.length <= 0)
      return res
        .status(400)
        .send({ message: "Invalid address", error: "Invalid address" });

    const wallets = addresses.split(",");
    const resp = await Promise.all(
      wallets.map(async (address) => ({
        transactions: await getWalletData(address, "transactions"),
        address,
      }))
    );

    const formattedResponse = resp.map((txn) => ({
      address: txn?.address,
      transactions: txn?.transactions?.data || [],
    }));

    return res.status(200).send(formattedResponse);
  } catch (e) {
    return res.status(404).send({ message: "not found", error: e });
  }
});
module.exports = router;
