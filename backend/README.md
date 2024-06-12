cd into backend
run => npm run dev t o start the server at port 9898

1) Getting Dashboard data

sent a POST request to http://localhost:3000/api/dashBoardfetch 

body of the request should contain {"userID":"user id of the user"}


Response would be of the format [Sample](sampleResponses/dashboard.json)

2) Adding Wallet

sent a POST request to http://localhost:3000/api/addWallet

body of the request should contain {"userID":"user User id","walletAddress":"wallet address to be added"}

on succesfull addittion of wallet we get "wallet added successfully" message as response

3) smartFilter 

sent a POST request to http://localhost:3000/api/smartFilter

body of the request should contain {"method":"symbol/chain","parameter":"chain name/ token name","data":"exact data in dashboard response form"}

example for the smart search for ETH token on all chains filter

{"method":"symbol","parameter":"ETH","data":"data from dashboard response"}

sample response is [sample](sampleResonses/symbolFilter.json)

example for the smart search for all tokens on ETH chain filter

{"method":"chain","parameter":"ETH","data":"data from dashboard response"}

sample response is [sample](sampleResonses/chainFilter.json)