import * as JSON from '../../build/contracts/Validator.json'
import * as DEXJSON from '../../build/contracts/Dex.json'
import * as Web3 from 'web3'
import * as _ from 'lodash'
import {constant} from '../constant'
import { join } from 'path'
import Validator from 'src/db/Validator.js'

const BigNumber = require('bignumber.js');

var contract
var dexContract
var contractAddress
var methods
var web3
var deployedBlock

var cursor

var DB_Validator
var DB_Event

var currentBlock
var lastBalance
var contractBalance
var safeRange
var stakeRequired
var totalSupply
var coinSupply
var burned
var CPT_ZOOM
var cpt
var validatorCount
var price = 0

async function getLastBlockNumber() {
    const model = DB_Event.getDBInstance()
    const event = await model.findOne({}).sort({blockNumber: -1})
    if (event) {
    //   console.log('xxx event', event)
      return event.blockNumber
    }
    return 0
}

async function getDeployedBlock(web3, data) {
    if (process.env.PRECOMPILED === 'true') return 0
    const deployedTxHash = data.transactionHash
    console.log('xxx deployedTxHash', deployedTxHash)
    const deployedTx = await web3.eth.getTransaction(deployedTxHash)
    console.log('xxx deployedTx', deployedTx)
    return Number(deployedTx.blockNumber)
}

export const initContract = async (DB) => {
    DB_Validator = DB.getModel('Validator')
    DB_Event = DB.getModel('Event')
    validatorCount = await DB_Validator.getDBInstance().find({isActive: true}).count()
    console.log('xxx current validatorCount', validatorCount)
    web3 = new Web3(process.env.ENDPOINT)
    const abi = JSON.abi
    const data = JSON.networks[process.env.NETWORK_ID]
    contractAddress = process.env.PRECOMPILED === 'true' ? process.env.CONTRACT_ADDRESS : data.address
    console.log('xxx validator contract address', contractAddress)
    contract = new web3.eth.Contract(abi, contractAddress)
    dexContract = new web3.eth.Contract(DEXJSON.abi, '0x0daFce56c6682AB1f8DdD5700A77c6BbE87865e8')
    deployedBlock = await getDeployedBlock(web3, data)
    console.log('xxx contract deployed at block ', deployedBlock)
    // LISTEN EVENTS ONLY FROM DEPLOYED BLOCK + 1
    cursor = deployedBlock
    methods = contract.methods
    const lastBlockNumber = await getLastBlockNumber()
    if (lastBlockNumber > cursor) {
        cursor = lastBlockNumber
    }

    // FIRST START
    if (validatorCount === 0) {
        await precompiledInit()    
    }
    CPT_ZOOM = await contract.methods.CPT_ZOOM().call()
    console.log('xxx start loading from block ', cursor + 1)
}

async function precompiledInit() {
    const calledBlock = deployedBlock + 1
    const n = await methods.count().call(null, calledBlock)
    for (let i = 0; i < Number(n); await i++) {
        const coinbase = await methods.coinbases(i).call(null, calledBlock)
        const validator = await methods.coinbaseValidators(coinbase).call()
        const stake = await methods.balanceOf(validator).call()
        const data = {
            address: validator.toLowerCase(),
            coinbase: coinbase,
            stake: stake,
            startTimerAtBlock: deployedBlock,
            isActive: true,
            // THIS COULD BE WRONG AT THE BEGIN
            unlockedAt: deployedBlock,
            credit: '0'
        }
        await DB_Validator.save(data)
    }
}

async function joined(data) {
    validatorCount ++
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const stake = data.returnValues._stake
    const coinbase = data.returnValues._coinbase
    const query = {
        address: address
    }
    const update = { address: address, stake: stake, coinbase: coinbase, isActive: true }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function left(data) {
    validatorCount --
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const query = {
        address: address
    }
    const update = { address: address, stake: '0', coinbase: '', isActive: false }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function staked(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const stake = data.returnValues._stake
    const query = {
        address: address
    }
    const update = { address: address, stake: stake }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function unstaked(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const stake = data.returnValues._stake
    const query = {
        address: address
    }
    const update = { address: address, stake: stake }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function frozenIncreased(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const frozenBalance = data.returnValues._frozenBalance
    const query = {
        address: address
    }
    const update = { address: address, frozenBalance: frozenBalance }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function frozenDecreased(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const frozenBalance = data.returnValues._frozenBalance
    const query = {
        address: address
    }
    const update = { address: address, frozenBalance: frozenBalance }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

// async function cashout(data) {
//     const eventName = data.event
//     const blockNumber = Number(data.blockNumber)
//     const address = (data.returnValues._validator).toLowerCase()
//     const amount = data.returnValues._amount
//     const frozenBalance = data.returnValues._frozenBalance
//     const query = {
//         address: address
//     }
//     const update = { address: address, frozenBalance: frozenBalance }
//     const options = { upsert: true, new: true, setDefaultsOnInsert: true };
//     const validator = await DB_Validator.findOneAndUpdate(query, update, options)
//     DB_Event.save({
//         validator: validator._id,
//         name: eventName,
//         blockNumber: blockNumber,
//         data: data.returnValues
//     })
// }

async function cashout(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const amount = data.returnValues._amount
    const frozenBalance = data.returnValues._frozenBalance
    const query = {
        address: address
    }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOne(query)
    const sum = new BigNumber(validator.claimedSum)
    const newSum = sum.plus(amount).toFixed(0)
    const update = { claimedSum: newSum, frozenBalance: frozenBalance}
    await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function locked(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const unlockedAt = Number(data.returnValues._unlockedAt)
    const query = {
        address: address
    }
    const update = { address: address, unlockedAt: unlockedAt }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function slashed(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const query = {
        address: address
    }
    const update = { address: address, isSlashed: true }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function penalized(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const amount = new BigNumber(data.returnValues._amount)
    const query = {
        address: address
    }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOne(query)
    
    const sum = new BigNumber(validator.penalizedSum)
    // const frozenBalance = new BigNumber(validator.frozenBalance)

    const newSum = sum.plus(amount).toFixed(0)
    // const newFrozenBalance = frozenBalance.minus(amount).toFixed(0)

    const update = { penalizedSum: newSum, $inc: {penalizedTimes: 1} }
    await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function creditUpdated(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const credit = data.returnValues._credit
    const query = {
        address: address
    }
    const update = { address: address, credit: credit }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function claimed(data) {
    // const eventName = data.event
    // const blockNumber = Number(data.blockNumber)
    // const address = (data.returnValues._validator).toLowerCase()
    // const amount = data.returnValues._amount
    // const query = {
    //     address: address
    // }
    // const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    // const validator = await DB_Validator.findOne(query)
    // const sum = new BigNumber(validator.claimedSum)
    // const newSum = sum.plus(amount).toFixed(0)
    // const update = { claimedSum: newSum}
    // await DB_Validator.findOneAndUpdate(query, update, options)
    // DB_Event.save({
    //     validator: validator._id,
    //     name: eventName,
    //     blockNumber: blockNumber,
    //     data: data.returnValues
    // })
}

async function cptUpdated(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    DB_Event.save({
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function lastBalanceUpdated(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    lastBalance = data.returnValues._lastBalance
    DB_Event.save({
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function pointUpdated(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const royaltyPoint = Number(data.returnValues._point)
    const query = {
        address: address
    }
    const update = { address: address, royaltyPoint: royaltyPoint }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function proofSubmitted(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const query = {
        address: address
    }
    const update = { address: address, $inc: {sealedBlocks: 1} }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function startTimer(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    const query = {
        address: address
    }
    const update = { address: address, startTimerAtBlock: blockNumber }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function metadataUpdated(data) {
    const eventName = data.event
    const blockNumber = Number(data.blockNumber)
    const address = (data.returnValues._validator).toLowerCase()
    let validator = await DB_Validator.findOne({address: address})
    if (!validator) return
    const metadata = await methods.validators(validator.coinbase).call()
    const query = {
        address: address
    }
    const update = { address: address, metadata: Object(metadata) }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    validator = await DB_Validator.findOneAndUpdate(query, update, options)
    DB_Event.save({
        validator: validator._id,
        name: eventName,
        blockNumber: blockNumber,
        data: data.returnValues
    })
}

async function cleanUp() {
    const count = await DB_Event.getDBInstance().count()
    if (count > 100000) {
        await DB_Event.getDBInstance().remove({})
    }
}

async function handleEvent(data) {
    await cleanUp()
    const eventName = data.event
    // console.log('xxx handleEvent', eventName)
    switch(eventName) {
        case constant.EVENT.Joined:
            await joined(data)
            break;
        case constant.EVENT.Left:
            await left(data)
            break;
        case constant.EVENT.Staked:
            await staked(data)
            break;
        case constant.EVENT.Unstaked:
            await unstaked(data)
            break;            
        case constant.EVENT.FrozenIncreased:
            await frozenIncreased(data)
            break;
        case constant.EVENT.FrozenDecreased:
            await frozenDecreased(data)
            break;
        case constant.EVENT.Claimed:
            await claimed(data)
            break;            
        case constant.EVENT.Locked:
            await locked(data)
            break;
        case constant.EVENT.Slashed:
            await slashed(data)
            break;
        case constant.EVENT.Penalized:
            await penalized(data)
            break;            
        case constant.EVENT.Cashout:
            await cashout(data)
            break;
        case constant.EVENT.CreditUpdated:
            await creditUpdated(data)
            break;

        case constant.EVENT.CptUpdated:
            await cptUpdated(data)
            break;
        case constant.EVENT.LastBalanceUpdated:
            await lastBalanceUpdated(data)
            break;

        case constant.EVENT.ProofSubmitted:
            await proofSubmitted(data)
            break;
        case constant.EVENT.PointUpdated:
            await pointUpdated(data)
            break;
        case constant.EVENT.StartTimer:
            await startTimer(data)
            break;
        case constant.EVENT.MetadataUpdated:
            await metadataUpdated(data)
            break;                                       
        default:
          // code block
      }
}

async function updateState() {
    const _currentBlock = Number(await web3.eth.getBlockNumber()) - 2
    if (_currentBlock <= currentBlock) return
    currentBlock = _currentBlock
    // cpt = await methods.getCpt().call()
    // console.log('xxx contractAddress', contractAddress )
    try {
        cpt = await methods.getCpt().call()
        console.log('xxx cpt', cpt)
    } catch(e) {
        console.log('xxx err await methods.getCpt().call()', e.toString())
    }

    try {
        coinSupply = await methods.coinSupply().call()
    } catch(e) {
        console.log('xxx err await methods.coinSupply().call()')
    }

    try {
        burned = await web3.eth.getBalance('0x000000000000000000000000000000000000dEaD')
    } catch(e) {
        console.log('xxx err burned')
    }

    try {
        totalSupply = await methods.totalSupply().call()
    } catch(e) {
        console.log('xxx err await methods.totalSupply().call()')
    }

    try {
        safeRange = await methods.safeRange().call()
    } catch(e) {
        console.log('xxx err await methods.safeRange().call()')
    }

    try {
        stakeRequired = await methods.stakeRequired().call()
    } catch(e) {
        console.log('xxx err await methods.stakeRequired().call()')
    }
    console.log('xxx synced to Block ', _currentBlock)
    // console.log('coinSupply', web3.utils.fromWei(coinSupply, 'ether'))
}

export const startListening = async () => {
    const loadInterval = Number(process.env.LOAD_INTERVAL)
    const blocksPerLoop = 1000
    setTimeout(async function(){
        await updateState()
        if (cursor !== currentBlock) {
            console.log('xxx cursor currentBlock', cursor, currentBlock)
            try {
                // await updateState()
                const toBlock = currentBlock > cursor + blocksPerLoop ? cursor + blocksPerLoop : currentBlock
                const events = await contract.getPastEvents('allEvents', {
                    filter: {},
                    fromBlock: cursor + 1,
                    toBlock: toBlock
                })
                // console.log('xxx events',cursor, toBlock, events)
                if (events.length > 0) {
                    for(let i = 0; i < events.length; await i++) {
                        const event = events[i]
                        await handleEvent(event)    
                    }
                }

                const matchingEvents = await dexContract.getPastEvents('Matching', {
                    filter: {
                        _sellBook: '0x30d36804204de843993d57a4e288c579e2c1cfc150e7b6a54e79d0afd0263ba9'
                    },
                    fromBlock: currentBlock - 100,
                    toBlock: currentBlock
                })
                if (matchingEvents.length > 0) {
                    const lastEvent = matchingEvents[matchingEvents.length - 1]
                    price = Number(lastEvent.returnValues._price) / 1e18
                    console.log('xxx updating last price', price)
                }

                cursor = toBlock
            } catch(e) {
                console.log('xxx error', e)
            }
        }
        startListening()
    }, loadInterval)

}

export const getState = async () => {
    const rs = {
        contractAddress: contractAddress,
        cursor: cursor,
        blockNumber:currentBlock,
        cpt: cpt,
        coinSupply: ((15030000000 + 64 * Number(currentBlock)) * 1e18).toFixed(0),
        burned: burned,
        count: validatorCount,
        totalSupply: totalSupply,
        safeRange: safeRange,
        CPT_ZOOM: CPT_ZOOM,
        stakeRequired: stakeRequired
    }
    return rs
}

export const getPrice = async () => {
    return price
}

export const getTotalStake = async () => {
    const validators = await DB_Validator.find({})
    let sum = 0
    for(const validator of validators) {
        const stake = Number(validator.stake) / 1e18
        sum += stake
    }
    return sum
}

export const getTotalSupply = async () => {
    return Number(coinSupply) / 1e18
}

// export const getMethods = () => {
//     return methods
// }

// logIndex: 14,
// transactionIndex: 0,
// transactionHash:
//  '0xf92fab104f62e0bfcbfb2ded980c22b66c392b4d66ba67943234bb0cbf2d18aa',
// blockHash:
//  '0x8e2e23884b3e32975b6417064cfd5a6914ab7fb44a503c8a7c96ce10cbc441bb',
// blockNumber: 16,
// address: '0x07CeeE5951233A238f3AFfaF30313C1b83bCe82d',
// type: 'mined',
// id: 'log_8fec3353',
// returnValues:
//  Result {
//    '0': '0xa6A482918C7C9d6Ec21Df18A8c8F5C6FE60B5A44',
//    '1': '46',
//    _validator: '0xa6A482918C7C9d6Ec21Df18A8c8F5C6FE60B5A44',
//    _unlockedAt: '46' },
// event: 'Locked',
// signature:
//  '0x9f1ec8c880f76798e7b793325d625e9b60e4082a553c98f42b6cda368dd60008',
// raw: { data: '0x', topics: [Array] } } ]