require('dotenv').config()
let Web3 = require('web3');
let BigNumber = require('big-number');
const fetch = require("node-fetch");
const INFURA_ID = process.env.INFURA_ID;
let provider = 'https://mainnet.infura.io/v3/' + INFURA_ID.toString();
let web3Provider = new Web3.providers.HttpProvider(provider);
let web3 = new Web3(web3Provider);

// need to condense all duplicate abis into same, so we have 1. StakingRewards, 2. SYFLPool, 3. LinkswapFactory, 4. LinkswapPair, 5. YYFL and LP

let stakingRewardsStakeAbi = [{"constant": "false", "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stake", "outputs": [], "payable": "false", "stateMutability": "nonpayable", "type": "function"}];
let sYflPoolStakeAbi = [{inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'stake', outputs: [], stateMutability: 'nonpayable', type: 'function'}];
let stakingRewardsClaimAbi = [{constant: false, inputs: [], name: 'claimRewards', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}];
let sYflPoolClaimAbi = [{constant: false, inputs: [], name: 'claimRewards', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}];
let createPairAbi = [{"inputs": [{"internalType": "address", "name": "newToken", "type": "address"}, {"internalType": "uint256", "name": "newTokenAmount", "type": "uint256"}, {"internalType": "address", "name": "lockupToken", "type": "address"}, {"internalType": "uint256", "name": "lockupTokenAmount", "type": "uint256"}, { "internalType": "uint256", "name": "lockupPeriod", "type": "uint256"}, {"internalType": "address", "name": "listingFeeToken", "type": "address"}],"name": "createPair","outputs": [{"internalType": "address", "name": "pair", "type": "address"}],"stateMutability": "nonpayable","type": "function"}];
let linkswapApproveAbi = [{"inputs": [{"internalType": "address","name": "spender","type": "address"}, {"internalType": "uint256","name": "value","type": "uint256"}],"name": "approve","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"}];
let linkswapSwapAbi = [{"inputs": [{"internalType": "uint256","name": "amount0Out","type": "uint256"},{"internalType": "uint256","name": "amount1Out","type": "uint256"},{"internalType": "address","name": "to","type": "address"},{"internalType": "bytes","name": "data","type": "bytes"}],"name": "swap","outputs": [],"stateMutability": "nonpayable","type": "function"}];
let yYflStakeAbi = [{inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],name: "stake",outputs: [],stateMutability: "nonpayable",type: "function"}];
let yYflWithdrawAbi = [{constant: false,inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],name: "withdraw",outputs: [],payable: false,stateMutability: "nonpayable",type: "function"}];
let yYflVoteAbi = [{inputs: [{ internalType: "uint256", name: "id", type: "uint256" },{ internalType: "bool", name: "support", type: "bool" },{ internalType: "uint256", name: "voteAmount", type: "uint256" },],name: "vote",outputs: [],stateMutability: "nonpayable",type: "function"}];
let yYflConvertAbi = [{inputs: [{ internalType: "address[]", name: "tokens", type: "address[]" },{ internalType: "uint256[]", name: "amounts", type: "uint256[]" },],name: "convertTokensToYfl",outputs: [],stateMutability: "nonpayable",type: "function"}];

const init = async () => {
  await web3.eth.getBlockNumber().then((result) => {
    console.log("Latest Ethereum Block is ",result);
  });

  let gasPrice = await web3.eth.getGasPrice()
  console.log("Current Ethereum gas price is " + gasPrice + " wei");

  let stakingRewardsInstance = new web3.eth.Contract(stakingRewardsStakeAbi, '0xBE0aB3Ae4F4Be9746388685a7dd2b4411c611143', {
    from: '0x1234567890123456789012345678901234567891', // default from address
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
  });

  let query = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false";
  let data = await fetch(query).then(resp => resp.json());
  let ethusd = data.ethereum.usd;

  var contractData = stakingRewardsInstance.methods.stake(1).bytecode;
  web3.eth.estimateGas({data: contractData})
    .then(function(result) {
      var gas = Number(result);
      var cost = new BigNumber(gas * gasPrice);
      var ethCost = web3.utils.fromWei(cost.toString(), 'ether');
      console.log("gas estimation = " + gas + " units");
      console.log("gas cost estimation = " + ethCost + " ether");
      console.log("gas cost estimation = " + ethCost*ethusd + " dollars");
    })
    .catch(function(error){
      console.log(error.toString());
    });
}

init();