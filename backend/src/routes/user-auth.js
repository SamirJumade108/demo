const express = require("express");
const router = express.Router();

const { updatePassword, triggerResetEmail, verifyToken, hashString } = require("../utils/user-auth");

router.get("/reset", async (req, res) => {
  const id = req.query.email;

  try {
    const status = await triggerResetEmail(id);
    
    return status ? res.status(200).send({ message: "Email Sent Successfully"}) : res.status(400).send({ message: "Invalid Request"});
  } catch (e) {
    return res.status(404).send({ message: "not found", error: e });
  }
});

router.post("/reset", async (req, res) => {
  const {email, token, password} = req.body;

  try {
    if (!email || email.length <= 0 || !token || token.length <= 0|| !password || password.length <= 0) 
      return res.status(400).send({ message: "Invalid Input", error: e });

    const isTokenValid = verifyToken(email, token)
    if (!isTokenValid) return res.status(400).send({ message: "Invalid Token", error: "Invalid Token"});  

    const hashedPassword = hashString(password);
    if (hashedPassword) await updatePassword( email, hashedPassword);

    return res.status(200).send({ message: "Password Change Successfully"});
  } catch (e) {
    console.log(e);
    return res.status(404).send({ message: "not found", error: e });
  }
});

module.exports = router;
