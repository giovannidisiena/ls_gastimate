# ls_gastimate
A script utilising `web3.eth.estimateGas()` to estimate the gas used in common Linkswap contract calls. It is currently estimating gas usage as a constant 53,000 units across all contract calls, which I don't suppose is exactly accurate, however it is still somewhat useful in demonstrating high gas fees in times of network congestion.

To get started, you will need to obtain an Infura endpoint and EthGasStation API key, using `.env.sample` to create your own `.env`:
```
INFURA_ID=
GASSTATION_API_KEY=
```
Then simply run `npm install` followed by `npm start`.
