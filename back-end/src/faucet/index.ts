import * as JSON from '../../build/contracts/Validator.json'
import * as Web3 from 'web3'
import * as _ from 'lodash'
import {constant} from '../constant'

const Tx = require('ethereumjs-tx')

var nonce = 0
var web3

var account
var privateKey

export const initFaucet = async () => {
    privateKey = process.env.FAUCET_PKEY
    web3 = new Web3(process.env.ENDPOINT)
    account = await web3.eth.accounts.privateKeyToAccount(privateKey);
    privateKey = new Buffer(privateKey.slice(2), 'hex')
    // console.log('xxx account', account)
    nonce = await web3.eth.getTransactionCount(account.address)
    // console.log('xxx nonce', nonce)
}

export const transfer = async (to, amount) => {
    const gasLimit = 21008
    const gasPrice = 1
    nonce++
    var rawTx = {
        from: account.address,
        to,
        nonce: web3.utils.toHex(nonce-1),
        value: web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether")),
        gas: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice.toString(), 'gwei')),
        // data:'0x0'
    }
    const tx = new Tx(rawTx);
    tx.sign(privateKey);

    const serializedTx = tx.serialize();
    var transactionHash = web3.utils.sha3('0x' + serializedTx.toString('hex'), { encoding: "hex" });
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
    return transactionHash
}