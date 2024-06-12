const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { getWalletData } = require("../utils/mobula-util");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);


router.post("/wallet/grouped", async (req, res) => {
    try {
        const { wallets, userID, name } = req.body;
        const { data } = await supabase.from("wallet_db").select("wallets").eq("users", userID)
        if (!data || data.length <= 0) {
            return res.status(400).send({ message: "Invalid UserID", error: "Invalid UserID" });
        }

        if (!wallets || wallets.length <= 1) {
            return res.status(400).send({ message: "Invalid Wallets", error: "Invalid Wallets" });
        }

        const groupedWallets = await supabase.from("wallet_db").select("grouped_wallets").eq("users", userID)

        let nameAlreadyTaken = false;
        if (groupedWallets.data && 
            groupedWallets.data[0].grouped_wallets && 
            groupedWallets.data[0].grouped_wallets.length > 0)
            groupedWallets.data[0].grouped_wallets.forEach((wallet) => {
                if (wallet.name === name) nameAlreadyTaken = true;
            });

        if (nameAlreadyTaken) return res.status(400).send({ message: "Name Already Exists", error: "Name Already Exists" });

        const updateGroupedWallets = groupedWallets?.data[0].grouped_wallets ? groupedWallets.data[0].grouped_wallets : [];
        updateGroupedWallets.push({
            name,
            wallets
        });

        await supabase.from("wallet_db").update({ grouped_wallets: updateGroupedWallets }).eq("users", userID)

        return res.status(200).send({});
    } catch (e) {
        console.log(e);
        return res.status(404).send({ message: "not", error: e });
    }
});

router.get("/wallet/grouped", async (req, res) => {
    try {
        const { userID } = req.query;
        const { data } = await supabase.from("wallet_db").select("wallets").eq("users", userID)
        if (!data || data.length <= 0) {
            return res.status(400).send({ message: "Invalid UserID", error: "Invalid UserID" });
        }

        const groupedWallets = await supabase.from("wallet_db").select("grouped_wallets").eq("users", userID)
        let formattedResponse = groupedWallets.data[0].grouped_wallets;
        if (formattedResponse && formattedResponse.length > 0) {
            formattedResponse = await Promise.all(formattedResponse.map(async(e) =>{
                const concatenatedWallets = e.wallets.map(obj => obj.publicKey).join(',');
                const aggregatedErc20Data = await getWalletData(concatenatedWallets, 'portfolio');
                return ({ name: e.name, wallets: e.wallets, aggregatedErc20Data: aggregatedErc20Data?.data || {} })
            }))
        }
        return res.status(200).send({groupedWallets: formattedResponse });
    } catch (e) {
        console.log(e);
        return res.status(404).send({ message: "not", error: e });
    }
});

router.delete("/wallet/grouped", async (req, res) => {
    try {
        const { userID, name } = req.body;
        const { data } = await supabase.from("wallet_db").select("wallets").eq("users", userID)
        if (!data || data.length <= 0) {
            return res.status(400).send({ message: "Invalid UserID", error: "Invalid UserID" });
        }
        const groupedWallets = await supabase.from("wallet_db").select("grouped_wallets").eq("users", userID)

        let updateGroupedWallets = groupedWallets.data[0].grouped_wallets ? groupedWallets.data[0].grouped_wallets : [];

        updateGroupedWallets = updateGroupedWallets.filter((w)=> !(w.name === name));

        await supabase.from("wallet_db").update({ grouped_wallets: updateGroupedWallets }).eq("users", userID)

        return res.status(200).send({});
    } catch (e) {
        return res.status(404).send({ message: "not", error: e });
    }
});
module.exports = router;