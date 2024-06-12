
const axios = require("axios");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname,"../../.env.local" )});
const nimbusurl = process.env.NIMBUS_API_ENDPOINT;
const nimbusapikey = process.env.NIMBUS_API_KEY;

const getWalletData = async (addresses, method) => {
    try {
      if(addresses.length !==0){
      const url = method==="history" ? `${nimbusurl}/v3/address/${addresses}/${method}`:`${nimbusurl}/v3/address/${method}`
      const headers = {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8,id;q=0.7",
        authority: "api.getnimbus.io",
        "content-type": "application/json",
        dnt: "1",
        origin: "https://app.getnimbus.io",
        referer: "https://app.getnimbus.io/",
        "sec-ch-ua":
          '"Chromium";v="116", "Not)A;Brand";v="24", "Microsoft Edge";v="116"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.76",
        "x-api-key": `${nimbusapikey}`,
      };
      const params = {
        chain: method==="history" ? "ALL" : "ETH,ARB,BNB,OP,AVAX,MATIC,BASE,SCROLL,ZKSYNC,LINEA,POLYGON_ZKEVM",
        addresses: Array.isArray(addresses)? String(addresses.join(",")):addresses,
      };
  
      const response = await axios.get(url, { headers, params });
      console.log(`${method} data fetched for  ${addresses}`);
      return response.data.data;
    }
    else{
      return [];
    }
    } catch (e) {
      return e;
    }
  };
  module.exports = { getWalletData };