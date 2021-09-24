const dotenv = require('dotenv');
const Tx = require('ethereumjs-tx')
const request = require('request');
dotenv.config();

const Web3 = require('web3')
const Utils = Web3.utils
// const endPoint = 'HTTP://127.0.0.1:8545'
// const endPoint = 'http://157.230.39.217:8545'
const endPoint = 'http://188.166.225.72:8080'
const web3 = new Web3(endPoint)
const PATH = '../core/build/contracts/'
const netID = 66666

const ValidatorJSON = require(PATH + 'Validator.json')
const Validator = {
    abi: ValidatorJSON.abi,
    address: '0x0000000000000000000000000000000000000066'
    // address: ValidatorJSON.networks[netID].address
}

const Validator_contract = new web3.eth.Contract(Validator.abi, Validator.address)

const METHODS = Validator_contract.methods

const account = process.env.GANACHE_ACCOUNT

const BLOCK_REWARD = Web3.utils.toWei('3', 'ether')

async function debug() {
    // await updateMetadata()
    // const metadata = await METHODS._validators('0x95e2fcBa1EB33dc4b8c6DCBfCC6352f0a253285d').call()
    // console.log('xxx metadata', Web3.utils.toAscii('0x74657374'))
    // leave()
    // console.log('xxx methods', METHODS)
    // const count = await METHODS.count().call()
    // console.log('xxx count', count)
    // const stakeRequired = await METHODS.stakeRequired().call()
    // console.log('xxx stakeRequired', Utils.fromWei(stakeRequired, 'ether'))
    const isValidator = await METHODS.isValidator('0xe94D5A92aeacAfF99fe1AB6988DdB3e66c9FD4eb').call()
    console.log('xxx isValidator', isValidator)
    const isCoinbase = await METHODS.isCoinbase('0xe94D5A92aeacAfF99fe1AB6988DdB3e66c9FD4eb').call()
    console.log('xxx isCoinbase', isCoinbase)
    return
    const totalSupply = await METHODS.totalSupply().call()
    console.log('xxx totalSupply', Utils.fromWei(totalSupply, 'ether'))
    const penalizedBase = await METHODS.penalizedBase().call()
    console.log('xxx penalizedBase', Utils.fromWei(penalizedBase, 'ether'))
    const coinSupply = await METHODS.coinSupply().call()
    console.log('xxx coinSupply', Utils.fromWei(coinSupply, 'ether'))
    for(let i = 0; i < Number(count); i++) {
        const coinbase = await METHODS.coinbases(i).call()
        const validator = await METHODS.coinbaseValidators(coinbase).call()
        const stake = await METHODS.balanceOf(validator).call()
        const reward = await METHODS.rewardOf(validator).call()
        const walletBalance = await METHODS.getWalletBalance(validator).call()
        console.log(
            'xxx coinbase', i, coinbase, 
            ' validator ', validator, 
            'stake ', Utils.fromWei(stake, 'ether'), 
            'reward', Utils.fromWei(reward, 'ether'),
            'wallet', Utils.fromWei(walletBalance, 'ether')
        )
    }
    const test = await METHODS.getWalletBalance('0xDD6aE9f37BA5e7c35c20BA94528DcF008a5a0E9A').call()
    console.log('xxx test', test)
    // const coinbases = await METHODS.coinbases().call()
    // console.log('xxx coinbases', coinbases)
}

async function report(_royalCoinbase, _reportedCoinbase) {
    await METHODS.report(_royalCoinbase, _reportedCoinbase).send({from: account, gas: 1000000})
}

async function leave() {
    await METHODS.leave().send({from: account, gas: 1000000})
}

async function updateMetadata() {
    const test = 'test'
    const testBytes32= Web3.utils.fromAscii('test')
    // bytes32 _firstName,
    // bytes32 _lastName,
    // bytes32 _licenseId,
    // string memory _fullAddress,
    // bytes32 _state,
    // bytes32 _zipcode,
    // uint256 _expirationDate,
    // uint256 _createdDate,
    // uint256 _updatedDate,
    // uint256 _minThreshold,
    // bytes32 _contactEmail,
    // bool _isCompany
    await METHODS.updateMetadata(testBytes32, testBytes32, testBytes32, test, testBytes32, testBytes32, 0, 0, 0, 0, testBytes32, true).send({from: account, gas: 1000000})
}

// async function getEvents() {
    // const bob = secp256k1.accountFromPrivateKey(process.env.ACCOUNT_0);
    // const privateKey = ((bob.privateKey).split('x'))[1]
    // ZkAssetMintable_contract.getPastEvents('CreateNote', {
    //     filter: {}, // Using an array means OR: e.g. 20 or 23
    //     fromBlock: 0,
    //     toBlock: 'latest'
    // }, async function(error, events){
    //     const event = events[0]
    //     // const nodeDataS = ((events[0].raw.data).split('x'))[1]
    //     // const nodeData = Buffer.from(events[0].raw.data, 'hex')
    //     // // console.log(nodeData); 
    //     // console.log('xxx rs ',nodeData.length)
    //     const viewingKey = '0x0129ca3a9e0e7bbe1232f667b7861e5d165d0c5ac396eedd955c9503a3e039bc0000006403adb83c003dc737def3228b08499802bc8a87667b4b8dc035a1186eb19fa9b502'
    //     // const note = await aztec.note.fromViewKey(viewingKey)
    //     const note = await aztec.note.fromEventLog(event.returnValues.metadata)
    //     // const rs = await note.derive(bob.privateKey)
    //     console.log('xxx note ',note)
    // })
    // .then(function(events){
    //     // console.log(events) // same results as the optional callback above
    // });
    
// }

// should revert
// report('0x887C5f6E89D75c6A9Cc238246B2e6ddde9a2C6f3', '0x45490d60438386471Cad5C409B5E115068dfDa95')
// debug()
// leave()
// getEvents()

// xxx coinbase 0 0x887C5f6E89D75c6A9Cc238246B2e6ddde9a2C6f3  validator  0x95e2fcBa1EB33dc4b8c6DCBfCC6352f0a253285d stake  1
// xxx coinbase 1 0x45490d60438386471Cad5C409B5E115068dfDa95  validator  0xDD6aE9f37BA5e7c35c20BA94528DcF008a5a0E9A stake  1
// xxx coinbase 2 0x6F43de103Cfb736969D4A97D4554CFf90C47993a  validator  0xa6A482918C7C9d6Ec21Df18A8c8F5C6FE60B5A44 stake  2

async function getFee(address) {
    // {
    //     "jsonrpc": "2.0",
    //     "method": "eth_getFee",
    //     "params": [
    //         "0x7FF4fe65583c0d60427D883134146F303c7a2D30",
    //         "latest"
    //     ],
    //     "id": 1
    // }
    const payload = {
        jsonrpc: '2.0',
        method: 'eth_getFee',
        params: [address, 'latest'],
        id: 1,
      }
      let options = {
        url: endPoint,
        method: "post",
        headers:
        { 
        //  "content-type": "text/plain"
        "content-type": "application/json"
        },
        body: JSON.stringify(payload)
    };
      const rs = await new Promise(function (resolve, reject) {
            request(options, (error, res, body) => {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
            });
        });
        console.log('xxx rs', rs)
    // request(options, (error, response, body) => {
    //     if (error) {
    //         console.error('An error has occurred: ', error);
    //     } else {
    //         console.log('Post successful: response: ', body);
    //     }
    // });
}
// const testAddress = '0x7FF4fe65583c0d60427D883134146F303c7a2D30'
// getFee(testAddress)

async function getEvents() {
    const options = {
        fromBlock: 0,
        toBlock: 'latest'
    }
    const events = await Validator_contract.getPastEvents('Penalized', options)
    console.log('xxx events', events)
    console.log('xxx amount', web3.utils.fromWei('39750092550000000000000000'))
}

async function callFunction(address) {
    const rs = await Validator_contract.methods.getFrozenBalance(address).call()
    console.log('xxx frozen', rs)
    console.log('xxx penalized', web3.utils.fromWei('39750092550000000000000000'))
    return rs
}

async function getNonce(address) {
    const rs = await web3.eth.getTransactionCount(address)
    return rs
}

// async function getAccount(privateKey) {
//     const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// }

async function unfrozen() {
    const address = '0x47aaEbf390CD5becBC23D73C19AB2631639FDb1C'
    // const amount = await callFunction(address)
    // console.log('xxx amount', amount)
    // const balance = await web3.eth.getBalance(address)
    // console.log('xxx balance', balance)
    // console.log('xxx frozen', 93100109122460981/1e18)
    const totalStake = await Validator_contract.methods.totalSupply().call()
    console.log('xxx totalStake', Number(totalStake)/ 1e18)
    return
    const nonce = await getNonce(address)
    const privateKey = new Buffer(
        'df4dd84584044d987df5f6d94cecd56130356e0b6648d2a6edb4bb405f03e659',
        'hex'
    );
    // Dex.methods.create(sellBookId, weiAmount, zoomedPrice, invalidPointer)
    const dataObject = Validator_contract.methods.cashout(amount)
    let rawTransaction = {
        'from': address,
        'gasPrice': web3.utils.toHex(Number(60) * 1e9),
        'gasLimit': web3.utils.toHex('6000000'),
        'to': Validator.address,
        // 'value': '0x0',
        'data': dataObject.encodeABI(),
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

async function test() {
    const totalStake = await Validator_contract.methods.totalSupply().call()
    console.log('xxx totalStake', Number(totalStake)/ 1e18)
    const validatorAddresses = [
        '0x0809d675EF6B8023007490F648dB1a34863B9667',
        '0xCb3f3570e65944A872ed52E9f69a7f0a7DD3e63b',
        '0x315F903Be658e1E81014c017ab1a24f356Dd96C7',
        '0xb6A5d20D2c5556382b32B90F9Df8c640009C005B',
        '0x3b83E4E8Fd6918115736a32eF1b9419143aBe34C'
    ]

    const rs = []
    for(let address of validatorAddresses) {
        const stake = await Validator_contract.methods.balanceOf(address).call()
        rs.push({
            address,
            stake: Number(stake) / 1e18, 
            coinbase: await Validator_contract.methods.validatorCoinbases(address).call()
        })
    }
    console.log('xxx validators', rs)
    const validatorCount = await Validator_contract.methods.count().call()
    console.log('xxx validator count', validatorCount)
}

test()

// getEvents()
// callFunction()
// unfrozen()
