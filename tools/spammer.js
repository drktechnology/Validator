// SPAMMER 0x6C025fB26Bdc4118113F74c4E035F689c462d5ea
const dotenv = require('dotenv');
dotenv.config();

const Web3 = require('web3')
const Tx = require('ethereumjs-tx')
const Utils = Web3.utils
const endPoint = process.env.ENDPOINT
const web3 = new Web3(endPoint)
const hexPrivateKey = process.env.SPAMMER_PKEY
const privateKey = Buffer.from(hexPrivateKey.slice(2), 'hex')
const spammer = web3.eth.accounts.privateKeyToAccount(hexPrivateKey)
const gasPrice = Number(process.env.GASPRICE) * 1e9
const contractAddress = process.env.SPAM_CONTRACT
const BLOCKTIME = 2000

var nonce

async function getNonce(address) {
    const rs = await web3.eth.getTransactionCount(address)
    return rs
}

async function sendSpamTx(gasLimit) {
    let rawTransaction = {
        'from': spammer.address,
        'gasPrice': web3.utils.toHex(gasPrice),
        'gasLimit': web3.utils.toHex(gasLimit),
        'to': contractAddress,
        'value': web3.utils.toHex(gasLimit),
        'data': '0x0',
        'nonce': web3.utils.toHex(nonce)
      }
      console.log(rawTransaction)
      let transaction = new Tx(rawTransaction);
      // signing transaction with private key
      transaction.sign(privateKey)
      // sending transacton via web3 module
      web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex')) // .on('transactionHash', console.log)
      nonce++
}

async function spam() {
    console.log('xxx address', spammer.address)
    nonce = await getNonce(spammer.address)
    console.log('xxx start with nonce = ', nonce)
    const gasLimit = 80* 1e6
    setInterval(function(){
        sendSpamTx(gasLimit)
    }, BLOCKTIME);
}

spam()
//0x57685693eF7Abc2D5bc52F259EAf7A3B1CfA8B2b