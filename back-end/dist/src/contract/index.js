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
exports.getTotalSupply = exports.getTotalStake = exports.getPrice = exports.getState = exports.startListening = exports.initContract = void 0;
const JSON = require("../../build/contracts/Validator.json");
const DEXJSON = require("../../build/contracts/Dex.json");
const Web3 = require("web3");
const constant_1 = require("../constant");
const BigNumber = require('bignumber.js');
var contract;
var dexContract;
var contractAddress;
var methods;
var web3;
var deployedBlock;
var cursor;
var DB_Validator;
var DB_Event;
var currentBlock;
var lastBalance;
var contractBalance;
var safeRange;
var stakeRequired;
var totalSupply;
var coinSupply;
var CPT_ZOOM;
var cpt;
var validatorCount;
var price = 0;
function getLastBlockNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        const model = DB_Event.getDBInstance();
        const event = yield model.findOne({}).sort({ blockNumber: -1 });
        if (event) {
            return event.blockNumber;
        }
        return 0;
    });
}
function getDeployedBlock(web3, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.PRECOMPILED === 'true')
            return 0;
        const deployedTxHash = data.transactionHash;
        console.log('xxx deployedTxHash', deployedTxHash);
        const deployedTx = yield web3.eth.getTransaction(deployedTxHash);
        console.log('xxx deployedTx', deployedTx);
        return Number(deployedTx.blockNumber);
    });
}
exports.initContract = (DB) => __awaiter(void 0, void 0, void 0, function* () {
    DB_Validator = DB.getModel('Validator');
    DB_Event = DB.getModel('Event');
    validatorCount = yield DB_Validator.getDBInstance().find({ isActive: true }).count();
    console.log('xxx current validatorCount', validatorCount);
    web3 = new Web3(process.env.ENDPOINT);
    const abi = JSON.abi;
    const data = JSON.networks[process.env.NETWORK_ID];
    contractAddress = process.env.PRECOMPILED === 'true' ? process.env.CONTRACT_ADDRESS : data.address;
    console.log('xxx validator contract address', contractAddress);
    contract = new web3.eth.Contract(abi, contractAddress);
    dexContract = new web3.eth.Contract(DEXJSON.abi, '0x0daFce56c6682AB1f8DdD5700A77c6BbE87865e8');
    deployedBlock = yield getDeployedBlock(web3, data);
    console.log('xxx contract deployed at block ', deployedBlock);
    cursor = deployedBlock;
    methods = contract.methods;
    const lastBlockNumber = yield getLastBlockNumber();
    if (lastBlockNumber > cursor) {
        cursor = lastBlockNumber;
    }
    if (validatorCount === 0) {
        yield precompiledInit();
    }
    CPT_ZOOM = yield contract.methods.CPT_ZOOM().call();
    console.log('xxx start loading from block ', cursor + 1);
});
function precompiledInit() {
    return __awaiter(this, void 0, void 0, function* () {
        const calledBlock = deployedBlock + 1;
        const n = yield methods.count().call(null, calledBlock);
        for (let i = 0; i < Number(n); yield i++) {
            const coinbase = yield methods.coinbases(i).call(null, calledBlock);
            const validator = yield methods.coinbaseValidators(coinbase).call();
            const stake = yield methods.balanceOf(validator).call();
            const data = {
                address: validator.toLowerCase(),
                coinbase: coinbase,
                stake: stake,
                startTimerAtBlock: deployedBlock,
                isActive: true,
                unlockedAt: deployedBlock,
                credit: '0'
            };
            yield DB_Validator.save(data);
        }
    });
}
function joined(data) {
    return __awaiter(this, void 0, void 0, function* () {
        validatorCount++;
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const stake = data.returnValues._stake;
        const coinbase = data.returnValues._coinbase;
        const query = {
            address: address
        };
        const update = { address: address, stake: stake, coinbase: coinbase, isActive: true };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function left(data) {
    return __awaiter(this, void 0, void 0, function* () {
        validatorCount--;
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const query = {
            address: address
        };
        const update = { address: address, stake: '0', coinbase: '', isActive: false };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function staked(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const stake = data.returnValues._stake;
        const query = {
            address: address
        };
        const update = { address: address, stake: stake };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function unstaked(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const stake = data.returnValues._stake;
        const query = {
            address: address
        };
        const update = { address: address, stake: stake };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function frozenIncreased(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const frozenBalance = data.returnValues._frozenBalance;
        const query = {
            address: address
        };
        const update = { address: address, frozenBalance: frozenBalance };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function frozenDecreased(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const frozenBalance = data.returnValues._frozenBalance;
        const query = {
            address: address
        };
        const update = { address: address, frozenBalance: frozenBalance };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function cashout(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const amount = data.returnValues._amount;
        const frozenBalance = data.returnValues._frozenBalance;
        const query = {
            address: address
        };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOne(query);
        const sum = new BigNumber(validator.claimedSum);
        const newSum = sum.plus(amount).toFixed(0);
        const update = { claimedSum: newSum, frozenBalance: frozenBalance };
        yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function locked(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const unlockedAt = Number(data.returnValues._unlockedAt);
        const query = {
            address: address
        };
        const update = { address: address, unlockedAt: unlockedAt };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function slashed(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const query = {
            address: address
        };
        const update = { address: address, isSlashed: true };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function penalized(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const amount = new BigNumber(data.returnValues._amount);
        const query = {
            address: address
        };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOne(query);
        const sum = new BigNumber(validator.penalizedSum);
        const newSum = sum.plus(amount).toFixed(0);
        const update = { penalizedSum: newSum, $inc: { penalizedTimes: 1 } };
        yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function creditUpdated(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const credit = data.returnValues._credit;
        const query = {
            address: address
        };
        const update = { address: address, credit: credit };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function claimed(data) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function cptUpdated(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        DB_Event.save({
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function lastBalanceUpdated(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        lastBalance = data.returnValues._lastBalance;
        DB_Event.save({
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function pointUpdated(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const royaltyPoint = Number(data.returnValues._point);
        const query = {
            address: address
        };
        const update = { address: address, royaltyPoint: royaltyPoint };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function proofSubmitted(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const query = {
            address: address
        };
        const update = { address: address, $inc: { sealedBlocks: 1 } };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function startTimer(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        const query = {
            address: address
        };
        const update = { address: address, startTimerAtBlock: blockNumber };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function metadataUpdated(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventName = data.event;
        const blockNumber = Number(data.blockNumber);
        const address = (data.returnValues._validator).toLowerCase();
        let validator = yield DB_Validator.findOne({ address: address });
        if (!validator)
            return;
        const metadata = yield methods.validators(validator.coinbase).call();
        const query = {
            address: address
        };
        const update = { address: address, metadata: Object(metadata) };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        validator = yield DB_Validator.findOneAndUpdate(query, update, options);
        DB_Event.save({
            validator: validator._id,
            name: eventName,
            blockNumber: blockNumber,
            data: data.returnValues
        });
    });
}
function cleanUp() {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield DB_Event.getDBInstance().count();
        if (count > 100000) {
            yield DB_Event.getDBInstance().remove({});
        }
    });
}
function handleEvent(data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield cleanUp();
        const eventName = data.event;
        switch (eventName) {
            case constant_1.constant.EVENT.Joined:
                yield joined(data);
                break;
            case constant_1.constant.EVENT.Left:
                yield left(data);
                break;
            case constant_1.constant.EVENT.Staked:
                yield staked(data);
                break;
            case constant_1.constant.EVENT.Unstaked:
                yield unstaked(data);
                break;
            case constant_1.constant.EVENT.FrozenIncreased:
                yield frozenIncreased(data);
                break;
            case constant_1.constant.EVENT.FrozenDecreased:
                yield frozenDecreased(data);
                break;
            case constant_1.constant.EVENT.Claimed:
                yield claimed(data);
                break;
            case constant_1.constant.EVENT.Locked:
                yield locked(data);
                break;
            case constant_1.constant.EVENT.Slashed:
                yield slashed(data);
                break;
            case constant_1.constant.EVENT.Penalized:
                yield penalized(data);
                break;
            case constant_1.constant.EVENT.Cashout:
                yield cashout(data);
                break;
            case constant_1.constant.EVENT.CreditUpdated:
                yield creditUpdated(data);
                break;
            case constant_1.constant.EVENT.CptUpdated:
                yield cptUpdated(data);
                break;
            case constant_1.constant.EVENT.LastBalanceUpdated:
                yield lastBalanceUpdated(data);
                break;
            case constant_1.constant.EVENT.ProofSubmitted:
                yield proofSubmitted(data);
                break;
            case constant_1.constant.EVENT.PointUpdated:
                yield pointUpdated(data);
                break;
            case constant_1.constant.EVENT.StartTimer:
                yield startTimer(data);
                break;
            case constant_1.constant.EVENT.MetadataUpdated:
                yield metadataUpdated(data);
                break;
            default:
        }
    });
}
function updateState() {
    return __awaiter(this, void 0, void 0, function* () {
        const _currentBlock = Number(yield web3.eth.getBlockNumber()) - 2;
        if (_currentBlock <= currentBlock)
            return;
        currentBlock = _currentBlock;
        try {
            cpt = yield methods.getCpt().call();
            console.log('xxx cpt', cpt);
        }
        catch (e) {
            console.log('xxx err await methods.getCpt().call()', e.toString());
        }
        try {
            coinSupply = yield methods.coinSupply().call();
        }
        catch (e) {
            console.log('xxx err await methods.coinSupply().call()');
        }
        try {
            totalSupply = yield methods.totalSupply().call();
        }
        catch (e) {
            console.log('xxx err await methods.totalSupply().call()');
        }
        try {
            safeRange = yield methods.safeRange().call();
        }
        catch (e) {
            console.log('xxx err await methods.safeRange().call()');
        }
        try {
            stakeRequired = yield methods.stakeRequired().call();
        }
        catch (e) {
            console.log('xxx err await methods.stakeRequired().call()');
        }
        console.log('xxx synced to Block ', _currentBlock);
    });
}
exports.startListening = () => __awaiter(void 0, void 0, void 0, function* () {
    const loadInterval = Number(process.env.LOAD_INTERVAL);
    const blocksPerLoop = 1000;
    setTimeout(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield updateState();
            if (cursor !== currentBlock) {
                console.log('xxx cursor currentBlock', cursor, currentBlock);
                try {
                    const toBlock = currentBlock > cursor + blocksPerLoop ? cursor + blocksPerLoop : currentBlock;
                    const events = yield contract.getPastEvents('allEvents', {
                        filter: {},
                        fromBlock: cursor + 1,
                        toBlock: toBlock
                    });
                    if (events.length > 0) {
                        for (let i = 0; i < events.length; yield i++) {
                            const event = events[i];
                            yield handleEvent(event);
                        }
                    }
                    const matchingEvents = yield dexContract.getPastEvents('Matching', {
                        filter: {
                            _sellBook: '0x30d36804204de843993d57a4e288c579e2c1cfc150e7b6a54e79d0afd0263ba9'
                        },
                        fromBlock: currentBlock - 100,
                        toBlock: currentBlock
                    });
                    if (matchingEvents.length > 0) {
                        const lastEvent = matchingEvents[matchingEvents.length - 1];
                        price = Number(lastEvent.returnValues._price) / 1e18;
                        console.log('xxx updating last price', price);
                    }
                    cursor = toBlock;
                }
                catch (e) {
                    console.log('xxx error', e);
                }
            }
            exports.startListening();
        });
    }, loadInterval);
});
exports.getState = () => __awaiter(void 0, void 0, void 0, function* () {
    const rs = {
        contractAddress: contractAddress,
        cursor: cursor,
        blockNumber: currentBlock,
        cpt: cpt,
        coinSupply: ((15030000000 + 64 * Number(currentBlock)) * 1e18).toFixed(0),
        count: validatorCount,
        totalSupply: totalSupply,
        safeRange: safeRange,
        CPT_ZOOM: CPT_ZOOM,
        stakeRequired: stakeRequired
    };
    return rs;
});
exports.getPrice = () => __awaiter(void 0, void 0, void 0, function* () {
    return price;
});
exports.getTotalStake = () => __awaiter(void 0, void 0, void 0, function* () {
    const validators = yield DB_Validator.find({});
    let sum = 0;
    for (const validator of validators) {
        const stake = Number(validator.stake) / 1e18;
        sum += stake;
    }
    return sum;
});
exports.getTotalSupply = () => __awaiter(void 0, void 0, void 0, function* () {
    return Number(coinSupply) / 1e18;
});
//# sourceMappingURL=index.js.map