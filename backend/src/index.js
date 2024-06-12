const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;

const nftRoute = require("./routes/nft-fetch");
const erc20Route = require("./routes/erc20-fetch");
const dashboardRoute = require("./routes/dashboard-fetch");
const testRoute = require("./routes/test-fetch");

const erc20RouteV2 = require("./routes/v2/erc20-fetch");
const nftRouteV2 = require("./routes/v2/nft-fetch");
const historyRouteV2 = require("./routes/v2/history-fetch");
const transactionsRouteV2 = require("./routes/v2/transaction-fetch");
const dashboardRouteV2 = require("./routes/v2/dashboard-fetch");
const walletRouteV2 = require("./routes/v2/wallet-fetch");

const authorizedWallets = require("./routes/authorized-wallet");
const groupedWallets = require("./routes/grouped-wallets");
const authRoutes = require("./routes/user-auth");

const walletRoute = require("./routes/wallet-fetch");
const balanceRoute = require("./routes/balance");

const app = express();
const port = Number(process.env.PORT) || 9898;
if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }
  const refreshUserDataInterval = setInterval(() => {
  require('./refresh-user-data')();
}, 60000);
} else {

  app.use((req, res, next) => {
    console.log(`A ${req.method} request received at ${new Date().toString()}`);
    next();
  });

  app.use(express.json());
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get("/ping", (req, res) => {
    res.status(200).json({ result: "pong" });
  });

  app.use("/nft", nftRoute);
  app.use("/erc20", erc20Route);
  app.use("/dashboard", dashboardRoute);
  app.use("/test", testRoute);
  app.use("/wallet", walletRoute);
  app.use("/balance", balanceRoute);
  app.use("/user",authRoutes)
  app.use("/v2", erc20RouteV2);
  app.use("/v2", nftRouteV2);
  app.use("/v2", historyRouteV2);
  app.use("/v2", dashboardRouteV2)
  app.use("/v2", walletRouteV2)
  app.use("/v2", transactionsRouteV2)

  app.use("/", groupedWallets);
  app.use("/", authorizedWallets);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
module.exports = app;
