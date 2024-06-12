const { default: axios } = require("axios");
const { getWallets, getUsers, updateWallet } = require("./get-wallet");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
const nimbusv2 = process.env.NIMBUS_V2_API;
const getOverview = async (addresses) => {
  const requests = addresses.map((address) =>
    axios.get(`${nimbusv2}/${address}/overview?chain=ALL`)
  );

  const responses = await Promise.all(requests);

  const total_balance = responses.reduce(
    (total, response) => total + Number(response.data.data.overview.networth),
    0
  );

  return total_balance.toFixed(2);
};

const updateOverview = async (userID) => {
  console.log(`updating overview for ${userID}`);
  const wallets = await getWallets(userID, "wallets");
  const publicKeys = wallets.map((wallet) => wallet.publicKey);
  const total_balance = await getOverview(publicKeys);
  console.log("total balance of ", userID, "is", total_balance);
  const supabaseOverview = await getWallets(userID, "overview");

  supabaseOverview.push({ name: Date.now(), uv: total_balance });
  await updateWallet(supabaseOverview, userID);
};

const startUpdating = async () => {
  const userIDs = await getUsers();
  userIDs.map(async (userID) => {
    await updateOverview(userID);
  });
};

// startUpdating();

module.exports = { startUpdating };
