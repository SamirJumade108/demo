const express = require("express");
const router = express.Router();

const  {getWalletData}  = require("../utils/utils");
router.get("/nft/:address", async (req, res) => {
  const address = req.params.address;

  try {
   const data = await getWalletData(address, "nft-holding");
    return res.status(200).send(data);
  } catch (e) {
    return res.status(404).send({ message: "not found", error: e });
  }
});
module.exports = router;
