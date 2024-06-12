const express = require("express");
const router = express.Router();
const { getWalletData } = require("../../utils/mobula-util");

router.get("/erc20/:address", async (req, res) => {
  const address = req.params.address;
  try {
    if (!address || address.length <= 0) return res.status(400).send({ message: "Invalid address", error: "Invalid address" });

    const data = await getWalletData(address,"portfolio");

    return res.status(200).send(data);
  } catch (e) {
    return res.status(404).send({ message: "not found", error: e });
  }
});
module.exports = router;
