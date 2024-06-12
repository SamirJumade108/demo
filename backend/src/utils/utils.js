const { getWallets, getUsers, updateWallet } = require("./get-wallet");
const { getWalletData } = require("./get-wallet-data");
const { parseNFTData } = require("./parse-nft-data");
const { parseTokenData } = require("./parse-token-data");
const { startUpdating } = require("./update-overview");
const { calculateAllocationPercentage } = require("./parse-allocation-data");
const { allocationPercent } = require("./parse-allocation-dashboard");
const { getWalletDataTest } = require("./get-wallet-data-test");
const { mobulaUtil } = require('./mobula-util');

module.exports = {
  getWallets,
  getWalletData,
  parseNFTData,
  parseTokenData,
  getUsers,
  updateWallet,
  startUpdating,
  calculateAllocationPercentage,
  allocationPercent,
  getWalletDataTest,
  mobulaUtil
};
