"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfer = exports.initFaucet = void 0;
const Web3 = require("web3");
const Tx = require('ethereumjs-tx');
var nonce = 0;
var web3;
var account;
var privateKey;
exports.initFaucet = () => __awaiter(void 0, void 0, void 0, function* () {
    privateKey = process.env.FAUCET_PKEY;
    web3 = new Web3(process.env.ENDPOINT);
    account = yield web3.eth.accounts.privateKeyToAccount(privateKey);
    privateKey = new Buffer(privateKey.slice(2), 'hex');
    nonce = yield web3.eth.getTransactionCount(account.address);
});
exports.transfer = (to, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const gasLimit = 21008;
    const gasPrice = 1;
    nonce++;
    var rawTx = {
        from: account.address,
        to,
        nonce: web3.utils.toHex(nonce - 1),
        value: web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether")),
        gas: web3.utils.toHex(gasLimit),
        gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice.toString(), 'gwei')),
    };
    const tx = new Tx(rawTx);
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    var transactionHash = web3.utils.sha3('0x' + serializedTx.toString('hex'), { encoding: "hex" });
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    return transactionHash;
});
//# sourceMappingURL=index.js.map