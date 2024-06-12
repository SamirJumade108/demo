const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const { getWallets } = require("../../utils/utils");
const { getWalletData, parseTokenData, parseOverviewData } = require("../../utils/mobula-util");

const fetchData = async (wallets, userID, chain) => {
    try {

        const publicKeys = wallets.map((wallet) => wallet.publicKey);
        const concatenatedWallets = publicKeys.join(',');

        const response = await Promise.all([
            getWalletData(concatenatedWallets, 'portfolio'),
            ...(publicKeys.map(async (address) =>
            ({
                'erc20': await getWalletData(address, "portfolio", chain),
            }),
            ))]);

        const overviewFetchedData = response[0];
        const fetchedData = response.slice(1, response.length);
        // const dataOverview = await getWalletData(publicKeys,'history',chain);

        const WalletData = [];
        const overview = {
            accounts: [],
            overview: {
                networth: overviewFetchedData?.data?.total_wallet_balance || null,
                realisedProfit: overviewFetchedData?.data?.total_realized_pnl || null,
                unrealisedProfit: overviewFetchedData?.data?.total_unrealized_pnl || null
            },
        };

        fetchedData.forEach((data) => {
            WalletData.push(parseTokenData(data?.erc20?.data, data?.nft?.data));
            overview.accounts.push(parseOverviewData(data?.erc20?.data));
        });

        const allocPercent = overviewFetchedData?.data?.assets.map((e) => ({ tokenName: e.asset.name, allocationPercent: e.allocation }));
        const tokensWithAllocation = allocPercent ? allocPercent.filter(token => token.allocationPercent > 0) : {};

        return {
            WalletData,
            overview,
            aggregatedErc20Data: overviewFetchedData?.data || {},
            allocationPercent: tokensWithAllocation,
            // dataOverview: dataOverview?.data?.balance_history,
        };
    } catch (e) {
        return e;
    }
};

const fetchNftData = async (wallets, userID, chain) => {
    try {

        const publicKeys = wallets.map((wallet) => wallet.publicKey);

        const response = await Promise.all([
            ...(publicKeys.map(async (address) =>
            ({
                'nft': await getWalletData(address, "nfts", chain),
                'ownerAddress': address
            }),
            ))]);


        const WalletData = [];

        response.forEach((data) => {
            WalletData.push(parseTokenData({}, data?.nft?.data, data?.ownerAddress));
        });


        return {
            WalletData,
        };
    } catch (e) {
        return e;
    }
};

router.get("/dashboard/:userID", async (req, res) => {
    const userID = req.params.userID;
    const { chain } = req.query;
    try {
        if (!userID || userID.length <= 0) return res.status(400).send({ message: "Invalid UserID", error: "Invalid UserID" });

        let [wallets, authorizedWallets] = await Promise.all(
            [getWallets(userID, "wallets"),
            getWallets(userID, "authorized_wallets"),]
        );
        if (wallets?.length > 0 && authorizedWallets?.length > 0)
            wallets = [ ... wallets, ...authorizedWallets];
        else if (wallets?.length <=0 && authorizedWallets?.length > 0)
            wallets = authorizedWallets;
            
        const data = await fetchData(wallets, userID, chain);
        return res.status(200).send(data);
    } catch (e) {
        console.log(e)
        return res.status(404).send({ message: "not", error: e });
    }
});

router.get("/dashboard/trackingwallet/:userID", async (req, res) => {
    const userID = req.params.userID;
    const { chain } = req.query;
    try {
        if (!userID || userID.length <= 0) return res.status(400).send({ message: "Invalid UserID", error: "Invalid UserID" });

        let [wallets,
            //  authorizedWallets
            ] = await Promise.all(
            [
                getWallets(userID, "wallets"),
            // getWallets(userID, "authorized_wallets"),
        ]
        );
        // if (wallets.length > 0 && authorizedWallets.length > 0)
        //     wallets = [ ... wallets, ...authorizedWallets];
        // else if (wallets.length <=0 && authorizedWallets.length > 0)
        //     wallets = authorizedWallets;
            
        const data = await fetchData(wallets, userID, chain);
        return res.status(200).send(data);
    } catch (e) {
        return res.status(404).send({ message: "not", error: e });
    }
});

router.get("/dashboard/nfts/:userID", async (req, res) => {
    const userID = req.params.userID;
    const { chain } = req.query;

    try {
        if (!userID || userID.length <= 0) return res.status(400).send({ message: "Invalid UserID", error: "Invalid UserID" });
        let [wallets, authorizedWallets] = await Promise.all(
            [getWallets(userID, "wallets"),
            getWallets(userID, "authorized_wallets"),]
        );
        if (wallets?.length > 0 && authorizedWallets?.length > 0)
            wallets = [ ... wallets, ...authorizedWallets];
        else if (wallets?.length <=0 && authorizedWallets?.length > 0)
            wallets = authorizedWallets;
            
        const data = await fetchNftData(wallets, userID, chain);
        return res.status(200).send(data);
    } catch (e) {
        return res.status(404).send({ message: "not", error: e });
    }
});

router.get("/dashboard/history/:userID", async (req, res) => {
    try {
        const userID = req.params.userID;
        const { chain } = req.query;
        if (!userID || userID.length <= 0) return res.status(400).send({ message: "Invalid UserID", error: "Invalid UserID" });
        let [wallets, authorizedWallets] = await Promise.all(
            [getWallets(userID, "wallets"),
            getWallets(userID, "authorized_wallets"),]
        );
        if (wallets?.length > 0 && authorizedWallets?.length > 0)
            wallets = [ ... wallets, ...authorizedWallets];
        else if (wallets?.length <=0 && authorizedWallets?.length > 0)
            wallets = authorizedWallets;
            
        const publicKeys = wallets.map((wallet) => wallet.publicKey);
        const concatenatedWallets = publicKeys.join(',');
        const data = await getWalletData(concatenatedWallets,"history", chain);
  
      return res.status(200).send(data);
    } catch (e) {
      return res.status(404).send({ message: "not found", error: e });
    }
});

module.exports = router;
