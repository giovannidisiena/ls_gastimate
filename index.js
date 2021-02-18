require('dotenv').config()
let Web3 = require('web3');
let BigNumber = require('big-number');
const fetch = require("node-fetch");

const INFURA_ID = process.env.INFURA_ID;
const GASSTATION_API_KEY = process.env.GASSTATION_API_KEY;

let provider = 'https://mainnet.infura.io/v3/' + INFURA_ID.toString();
let web3Provider = new Web3.providers.HttpProvider(provider);
let web3 = new Web3(web3Provider);

let stakingRewardsAbi = [{"constant": "false", "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stake", "outputs": [], "payable": "false", "stateMutability": "nonpayable", "type": "function"}, {"constant": "false", "inputs": [], "name": "claimRewards", "outputs": [], "payable": "false", "stateMutability": "nonpayable", "type": "function"}];
let sYFLPoolAbi = [{"inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function"},{"constant": "false", "inputs": [], "name": "claimRewards", "outputs": [], "payable": "false", "stateMutability": "nonpayable", "type": "function"}];
let linkswapFactoryAbi = [{"inputs": [{"internalType": "address", "name": "newToken", "type": "address"}, {"internalType": "uint256", "name": "newTokenAmount", "type": "uint256"}, {"internalType": "address", "name": "lockupToken", "type": "address"}, {"internalType": "uint256", "name": "lockupTokenAmount", "type": "uint256"}, { "internalType": "uint256", "name": "lockupPeriod", "type": "uint256"}, {"internalType": "address", "name": "listingFeeToken", "type": "address"}],"name": "createPair","outputs": [{"internalType": "address", "name": "pair", "type": "address"}],"stateMutability": "nonpayable","type": "function"}];
let linkswapPairAbi = [{"inputs": [{"internalType": "address","name": "spender","type": "address"}, {"internalType": "uint256","name": "value","type": "uint256"}],"name": "approve","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "nonpayable","type": "function"}];
let linkswapRouterAbi = [{"inputs": [{"internalType": "address","name": "tokenA","type": "address"},{"internalType": "address","name": "tokenB","type": "address"},{"internalType": "uint256","name": "amountADesired","type": "uint256"},{"internalType": "uint256","name": "amountBDesired","type": "uint256"},{"internalType": "uint256","name": "amountAMin","type": "uint256"},{"internalType": "uint256","name": "amountBMin","type": "uint256"},{"internalType": "address","name": "to","type": "address"},{"internalType": "uint256","name": "deadline","type": "uint256"}],"name": "addLiquidity","outputs": [{"internalType": "uint256","name": "amountA","type": "uint256"},{"internalType": "uint256","name": "amountB","type": "uint256"},{"internalType": "uint256","name": "liquidity","type": "uint256"}],"stateMutability": "nonpayable","type": "function"}];
let yYFLAbi = [{"inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],"name": "stake","outputs": [],"stateMutability": "nonpayable","type": "function"},{"constant": "false","inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],"name": "withdraw","outputs": [],"payable": "false","stateMutability": "nonpayable","type": "function"},{"inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" },{ "internalType": "bool", "name": "support", "type": "bool" },{ "internalType": "uint256", "name": "voteAmount", "type": "uint256" },],"name": "vote","outputs": [],"stateMutability": "nonpayable","type": "function"}];

const init = async () => {
  await web3.eth.getBlockNumber().then((result) => {
    console.log("\nLatest Ethereum Block is ",result,"\n");
  });

  let stakingRewardsInstance = new web3.eth.Contract(stakingRewardsAbi, '0xBE0aB3Ae4F4Be9746388685a7dd2b4411c611143');
  let sYFLPoolInstance = new web3.eth.Contract(sYFLPoolAbi, '0x81C76925E7F41f0306E1147c4659784d4402bD51');
  let linkswapFactoryInstance = new web3.eth.Contract(linkswapFactoryAbi, '0x696708Db871B77355d6C2bE7290B27CF0Bb9B24b');
  let linkswapPairInstance = new web3.eth.Contract(linkswapPairAbi, '0x40F1068495Ba9921d6C18cF1aC25f718dF8cE69D');
  let linkswapRouterInstance = new web3.eth.Contract(linkswapRouterAbi, '0xA7eCe0911FE8C60bff9e99f8fAFcDBE56e07afF1');
  let yYFLInstance = new web3.eth.Contract(yYFLAbi, '0x75D1aA733920b14fC74c9F6e6faB7ac1EcE8482E');

  let coinGecko = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false";
  let priceData = await fetch(coinGecko).then(resp => resp.json());
  let ethusd = priceData.ethereum.usd;

  let ethGasStation = "https://ethgasstation.info/api/ethgasAPI.json?api-key=" + GASSTATION_API_KEY.toString();
  let gasData = await fetch(ethGasStation).then(resp => resp.json());
  let gasFees = { "fast": gasData.fast, "fastest": gasData.fastest, "safeLow": gasData.safeLow, "average": gasData.average};

  console.log("Current Ethereum gas prices:\n");
  Object.keys(gasFees).forEach(function(key) {
    gasFees[key] = gasFees[key]/10;
    gasOut = key.padding(7) + " : " + gasFees[key] + " Gwei\r\n";
    console.log(gasOut);
  });

  let contractDatas = {
    "stakingRewardsStake": stakingRewardsInstance.methods.stake(1),
    "stakingRewardsClaim": stakingRewardsInstance.methods.claimRewards(),
    "sYFLPoolStake": sYFLPoolInstance.methods.stake(1),
    "sYFLPoolClaim": sYFLPoolInstance.methods.claimRewards(),
    "linkswapFactoryCreatePair": linkswapFactoryInstance.methods.createPair(
      "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      0,
      "0x8888801aF4d980682e47f1A9036e589479e835C5",
      0,
      0,
      "0x8888801aF4d980682e47f1A9036e589479e835C5"
      ),
    "linkswapPairApprove": linkswapPairInstance.methods.approve(
      "0x0000000000000000000000000000000000000000",
      0
      ),
    "linkswapRouterAddLiquidity": linkswapRouterInstance.methods.addLiquidity(
      "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544",
      9240000000000000000,
      1039860364735969236,
      9193800000000000000,
      1034661062912289389,
      "0x9b7ad9Cb6207707cc70838c459d3185dDB4F6D00",
      1613514409
      ),
    "yYFLStake": yYFLInstance.methods.stake(1),
    "yYFLWithdraw": yYFLInstance.methods.withdraw(1),
    "yYFLVote": yYFLInstance.methods.vote(
      14,
      true,
      1
      )
  };

  function gastimate(key, value) {
    web3.eth.estimateGas({data: value.bytecode})
    .then(function(result) {
      var gas = Number(result);
      var costFast = gasFees["fast"]*gas;
      var costFastest = gasFees["fastest"]*gas;
      var costSafeLow = gasFees["safeLow"]*gas;
      var costAverage = gasFees["average"]*gas;
      var costFastWei = web3.utils.toWei(costFast.toString(), 'Gwei');
      var costFastestWei = web3.utils.toWei(costFastest.toString(), 'Gwei');
      var costSafeLowWei = web3.utils.toWei(costSafeLow.toString(), 'Gwei');
      var costAverageWei = web3.utils.toWei(costAverage.toString(), 'Gwei');
      var costFastEth = web3.utils.fromWei(costFastWei.toString(), 'ether');
      var costFastestEth = web3.utils.fromWei(costFastestWei.toString(), 'ether');
      var costSafeLowEth = web3.utils.fromWei(costSafeLowWei.toString(), 'ether');
      var costAverageEth = web3.utils.fromWei(costAverageWei.toString(), 'ether'); 
      console.log(key + " gas estimation = " + gas + " units");
      console.log(key + " average gas cost estimation = " + costAverageEth + " ether");
      console.log(key + " average gas cost estimation = " + costAverageEth*ethusd + " dollars");
      console.log(key + " fast gas cost estimation = " + costFastEth*ethusd + " dollars");
      console.log(key + " fastest gas cost estimation = " + costFastestEth*ethusd + " dollars");
      console.log(key + " safe low gas cost estimation = " + costSafeLowEth*ethusd + " dollars\r\n");
    })
    .catch(function(error){
      console.log(error.toString());
    });
  }  

  Object.keys(contractDatas).forEach(function(key) {
      gastimate(key, contractDatas[key]);
  });
  
}

init();

  /** https://stackoverflow.com/questions/17224130/formatting-text-with-tabs-or-spaces
 * object.padding(number, string)
 * Transform the string object to string of the actual width filling by the padding character (by default ' ')
 * Negative value of width means left padding, and positive value means right one
 *
 * @param       number  Width of string
 * @param       string  Padding chacracter (by default, ' ')
 * @return      string
 * @access      public
 */
String.prototype.padding = function(n, c)
{
        var val = this.valueOf();
        if ( Math.abs(n) <= val.length ) {
                return val;
        }
        var m = Math.max((Math.abs(n) - this.length) || 0, 0);
        var pad = Array(m + 1).join(String(c || ' ').charAt(0));
//      var pad = String(c || ' ').charAt(0).repeat(Math.abs(n) - this.length);
        return (n < 0) ? pad + val : val + pad;
//      return (n < 0) ? val + pad : pad + val;
};
