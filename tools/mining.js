const dotenv = require('dotenv');
const Tx = require('ethereumjs-tx')
dotenv.config();

const Web3 = require('web3')
const Utils = Web3.utils
const endPoint = 'HTTP://127.0.0.1:8545'
// const endPoint = 'http://157.230.39.217:8545'
const web3 = new Web3(endPoint)
const PATH = '../core/build/contracts/'
const netID = 66

const ValidatorJSON = require(PATH + 'Validator.json')
const Validator = {
    abi: ValidatorJSON.abi,
    address: ValidatorJSON.networks[netID].address
}

const Validator_contract = new web3.eth.Contract(Validator.abi, Validator.address)

const METHODS = Validator_contract.methods

const account = process.env.GANACHE_ACCOUNT

const BLOCK_REWARD = Utils.toWei('300', 'ether')

const BLOCK_TIME = 3 * 1000

async function mining() {
    setInterval(async function(){
        const _coinbase = '0x45490d60438386471Cad5C409B5E115068dfDa95'
        const rs = await METHODS.mining(_coinbase).send({from: account, value: BLOCK_REWARD, gas: 1000000})
        console.log('xxx', rs)
    }, BLOCK_TIME);
}

mining()