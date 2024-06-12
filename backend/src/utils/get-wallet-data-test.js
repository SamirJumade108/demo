const axios = require("axios");
const path = require("path");

const getWalletDataTest = async (address, method) => {
  try {
    console.log(`fecthing data for ${address} with method ${method}`);
    const url = `https://api.mobula.io/api/1/wallet/${method}`;
    const headers = {
      Authorization: "88527dc2-ad7b-4bd1-8b17-4796b28bf9a8",
    };
    const params = {
      chains: "Ethereum,Arbitrum,56,10,Polygon,Base,43114",
      wallets: String(address),
    };
    const response = await axios.get(url, { headers, params });
    return response.data;
  } catch (e) {
    return e;
  }
};
module.exports = { getWalletDataTest };
