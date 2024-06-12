const express = require("express");
const router = express.Router();
const NodeCache = require("node-cache");
const cron = require("node-cron");
const { createPublicClient, http, formatUnits } = require("viem");
const { mainnet } = require("viem/chains");
const { supabase } = require("../utils/supabase");
const statstoken = require("../config/tokenABI.json");

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
const cache = new NodeCache();
async function updateCache() {
  const { data: wallets, error } = await supabase.from("auth").select("*");

  if (error) {
    console.error("Error fetching wallets:", error);
    return;
  }
  for (const wallet of wallets) {
    if (!wallet.wallet) {
      return;
    }
    const balance = await checkTokenBalance(wallet.wallet);
    cache.set(wallet.wallet, balance, 3600);
  }
}
async function checkTokenBalance(address) {
  if (!address) {
    console.error("No address provided");
    return 0;
  }
  const balances = await publicClient.readContract({
    address: statstoken.address,
    abi: statstoken.abi,
    functionName: "balanceOf",
    args: [address],
  });
  if (balances === undefined) {
    console.error("Error fetching token balance:", error);
    return 0;
  }

  return Number(formatUnits(balances, 9));
}

updateCache();
cron.schedule("*/5 * * * *", updateCache);

router.get("/:wallet", async (req, res) => {
  const { wallet } = req.params;

  if (!wallet) {
    return res.status(400).send({ error: "No wallet provided" });
  }
  if (wallet.length !== 42) {
    return res.status(400).send({ error: "Invalid wallet address" });
  }
  const balance = cache.get(wallet);
  if (balance) {
    return res.status(200).send({ balance });
  }
  const newBalance = await checkTokenBalance(wallet);

  cache.set(wallet, newBalance, 3600);
  return res.status(200).send({ balance: newBalance });
});
module.exports = router;
