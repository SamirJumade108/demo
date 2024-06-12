const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { getWalletData } = require("../utils/mobula-util");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);


router.get("/wallet/authorized", async (req, res) => {
    try {
        const { userID } = req.query;
        const { data } = await supabase.from("wallet_db").select("wallets").eq("users", userID)
        if (!data || data.length <= 0) {
            return res.status(400).send({ message: "Invalid UserID", error: "Invalid UserID" });
        }

        const groupedWallets = await supabase.from("wallet_db").select("authorized_wallets").eq("users", userID)
        let formattedResponse = groupedWallets.data[0].authorized_wallets;
        if (formattedResponse && formattedResponse.length > 0) {
            formattedResponse = await Promise.all(formattedResponse.map(async(e) =>{
                const erc20Data = await getWalletData(e.publicKey, 'portfolio');
                return ({ walletName: e.walletName, publicKey: e.publicKey, erc20Data: erc20Data?.data || {} })
            }))
        }
        return res.status(200).send({authorizedWallets: formattedResponse });
    } catch (e) {
        return res.status(404).send({ message: "not", error: e });
    }
});

router.delete("/wallet/authorized", async (req, res) => {
    try {
        const { userID, name } = req.body;
        const { data } = await supabase.from("wallet_db").select("wallets").eq("users", userID)
        if (!data || data.length <= 0) {
            return res.status(400).send({ message: "Invalid UserID", error: "Invalid UserID" });
        }
        const groupedWallets = await supabase.from("wallet_db").select("authorized_wallets").eq("users", userID)

        let updateGroupedWallets = groupedWallets.data[0].authorized_wallets ? groupedWallets.data[0].authorized_wallets : [];
        updateGroupedWallets = updateGroupedWallets.filter((w)=> !(w.walletName === name));

        await supabase.from("wallet_db").update({ authorized_wallets: updateGroupedWallets }).eq("users", userID)

        return res.status(200).send({});
    } catch (e) {
        return res.status(404).send({ message: "not", error: e });
    }
});
module.exports = router;