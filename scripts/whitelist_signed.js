require('dotenv').config();
var Tx = require('ethereumjs-tx');

let ARRAY_OF_ADDRESSES = require('./ARRAY_OF_ADDRESSES.json');
ARRAY_OF_ADDRESSES = Array.from(new Set(ARRAY_OF_ADDRESSES));
const RPC_PORT = process.env.RPC_PORT;
const ICO_ADDRESS = process.env.ICO_ADDRESS;
const UNLOCKED_ADDRESS = process.env.UNLOCKED_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ICO_ABI = require('../build/contracts/EthearnalRepTokenCrowdsale.json').abi;

const Web3 = require('web3');
const MAINET_RPC_URL = 'https://mainnet.infura.io/metamask';
const KOVAN_RPC_URL = 'https://kovan.infura.io/metamask'
const RINKEBY_RPC_URL = 'https://rinkeby.infura.io/metamask'
const provider = new Web3.providers.HttpProvider(KOVAN_RPC_URL);
const privateKey = Buffer.from(PRIVATE_KEY, 'hex')
// const provider = new Web3.providers.HttpProvider(`http://localhost:${RPC_PORT}`);
const web3 = new Web3(provider);

const { filterAddresses, setup } = require('./filterAddresses');

setup({ web3Param: web3, contribAddress: ICO_ADDRESS});
const GAS_PRICE = web3.utils.toWei(process.env.GAS_PRICE, 'gwei');
const GAS_LIMIT = '6700000';
const myContract = new web3.eth.Contract(ICO_ABI, ICO_ADDRESS, {
    from: UNLOCKED_ADDRESS, // default from address
    gasPrice: GAS_PRICE,
    gas: GAS_LIMIT // default gas price in wei
});

filterAddresses(ARRAY_OF_ADDRESSES).then(async (toWhitelist) => {
    let currentInvestors = await myContract.methods.whitelistedInvestorCounter().call();
    currentInvestors = Number(currentInvestors.toString(10));
    console.log('current whitelisted investors: ', currentInvestors);
    console.log('to whitelist', toWhitelist.length);
    console.log('Expected total whitelisted count after execution', toWhitelist.length + currentInvestors);
    const addPerTx = 140;
    const slices = Math.ceil(toWhitelist.length / addPerTx);
    console.log(`THIS SCRIPT WILL GENERATE ${slices} transactions`);
    var txcount = await web3.eth.getTransactionCount(UNLOCKED_ADDRESS);
    const nonce = web3.utils.toHex(txcount);
    console.log('STARTED', nonce);
    return sendTransactionToContribution({array: toWhitelist, slice: slices, addPerTx, nonce});
}).then(console.log).catch(console.error);

async function sendTransactionToContribution({array, slice, addPerTx, nonce}) {
    if(array.length === 0){
        console.log('array doesnot have not whitelisted addresses');
        process.exit();
    }
    const start = (slice - 1) * addPerTx;
    const end = slice * addPerTx;
    const arrayToProcess = array.slice(start, end);
    let encodedData = myContract.methods.whitelistInvestors(arrayToProcess).encodeABI();
    
    console.log('Processing array length', arrayToProcess.length, arrayToProcess[0], arrayToProcess[arrayToProcess.length - 1]);
    return new Promise((res) => {
        web3.eth.estimateGas({
            from: UNLOCKED_ADDRESS, to: ICO_ADDRESS, data: encodedData, gas: GAS_LIMIT, gasPrice: GAS_PRICE
        }).then((gasNeeded) => {
            console.log('gasNeeded', gasNeeded);
            var rawTx = {
                nonce: nonce,
                gasPrice:  web3.utils.toHex(GAS_PRICE),
                gasLimit:   web3.utils.toHex(gasNeeded),
                to: ICO_ADDRESS,
                data: encodedData
              }
              var tx = new Tx(rawTx);
              tx.sign(privateKey);
              var serializedTx = tx.serialize();
              web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('transactionHash', function(hash){console.log('hash', hash)});
            //   console.log(receipt);
            // web3.eth.sendTransaction({
            //     from: UNLOCKED_ADDRESS, to: ICO_ADDRESS, data: encodedData, gas: gasNeeded, gasPrice: GAS_PRICE, nonce
            // }).on('transactionHash', function(hash){console.log('hash', hash)});
            slice--;
            if (slice > 0) {
                nonce = parseInt(nonce, 16);
                nonce++;
                nonce = web3.utils.toHex(nonce);
                sendTransactionToContribution({array, slice, addPerTx, nonce});
            } else {
                res({ result: 'completed' });
                // process.exit();
            }

        });
    })
}