pragma solidity ^0.5.0;

import "./openzeppelin/SafeMath.sol";
import "./Frozen.sol";
import "./Staking.sol";
import "./Lock.sol";
import "./Penalize.sol";
import "./ValidatorMetadata.sol";
import "./Premine.sol";

/**
 * @title drkchain validators smart contract
 */
contract Validator is ValidatorMetadata, Lock, Staking, Frozen, Penalize, Premine {
    using SafeMath for uint;

    event Joined(address indexed _validator, address indexed _coinbase, uint _stake);
    event Left(address indexed _validator, address indexed _coinbase);
    event Penalized(address indexed _validator, uint _amount);

    modifier onlyValidator() {
        require(isValidator(msg.sender), "Sender is not validator");
        _;
    }

    modifier onlyNotValidator(address _validator) {
        require(!isValidator(_validator), "Sender is already a validator");
        _;
    }

    modifier onlyNotCoinbase(address _coinbase) {
        require(!isCoinbase(_coinbase), "Coinbase already used");
        _;
    }

    modifier joinable() {
        require(lastJoinLeaveBlock + JOINING_PARAM * count() < block.number, "joining too quick could destroy concensus");
        _;
    }

    modifier reportable(address _reportedValidator) {
        require(isValidator(_reportedValidator), "reported address is not a validator");
        _;
    }

    modifier noJoinLeaveBefore() {
        require(lastJoinLeaveBlock != block.number, "only one action join/leave per block");
        _;
    }

    // zero address
    address constant public ZERO_ADDRESS = address(0x0);

    // the next joinable block is lastJoinedBlock + JOINING_PARAM * Number of current Validators
    uint constant public JOINING_PARAM = 1;

    // part of coinSupply to stake and become a validator
    uint constant public VALIDATOR_STAKE_RATE = 1000;

    // coinbases list
    address[] public coinbases;

    // pairing 1:1 validator and coinbase
    mapping(address => uint) public coinbasePosition;

    // validator's address of a coinbase
    mapping(address => address) public coinbaseValidators;
    // coinbase of a validator
    mapping(address => address) public validatorCoinbases;

    // last block leave or join action triggered
    uint public lastJoinLeaveBlock;

    // premine from genesis block
    uint public premineSum;

    /**
    * contract initialize
    */

    // this is checked before contract deployed
    // if misstake happends, just redeploy (never happens)
    constructor(
        address[] calldata _genesisValidators,
        address[] calldata _genesisCoinbases,
        uint[] calldata _genesisRVSBalances,
        string calldata name,
        string calldata symbol,
        uint8 decimals,
        address[] calldata _premineAddresses,
        uint[] calldata _premineBalances
    )
        public
        Staking(name, symbol, decimals)
    {
        // Require: arrays got same length, concensus takes care of this
        address _coinbase;
        address _validator;
        uint _RVSBalance;
        uint n = _genesisCoinbases.length;
        for (uint i = 0; i < n; i++) {
            _coinbase = _genesisCoinbases[i];
            _validator = _genesisValidators[i];
            _RVSBalance = _genesisRVSBalances[i];
            _stake(_validator, _RVSBalance);
            _addValidator(_validator, _coinbase);
        }
        // Require: arrays got same length, concensus takes care of this
        n = _premineAddresses.length;
        for (uint i = 0; i < n; i++) {
            _addPremine(_premineAddresses[i], _premineBalances[i]);
        }
    }

    // Penalize Process

    // Miners should add tx to call this public function,
    // else their work wont be counted and got trouble with reports in future
    function submitProof(
    )
        external
    {
        address _coinbase = block.coinbase;
        address _validator = coinbaseValidators[_coinbase];
        _submitProof(_validator);
    }

    function preparePenalize(
        address _reportedValidator,
        uint _expectedPenalizedAmount
    )
        internal
        returns(uint)
    {
        uint penalizedAmount = _expectedPenalizedAmount;
        uint frozenBalance = getFrozenBalance(_reportedValidator);
        // forced withdraw all reward balance
        if (frozenBalance < penalizedAmount) {
            uint toFrozenAmount = _claim(_reportedValidator);
            _pushToFrozen(_reportedValidator, toFrozenAmount);
            frozenBalance = getFrozenBalance(_reportedValidator);
        }

        // forced leave, if frozen doesnt have enough
        if (frozenBalance < penalizedAmount) {
            uint toFrozenAmount = _leave(_reportedValidator);
            _pushToFrozen(_reportedValidator, toFrozenAmount);
            _removeValidator(_reportedValidator);
            frozenBalance = getFrozenBalance(_reportedValidator);
        }

        // if penalizedAmount > whole locked balance of _reportedValidator
        if (frozenBalance < penalizedAmount) {
            penalizedAmount = frozenBalance;
        }
        return penalizedAmount;
    }

    // Any coinbase can report inactive validators and get royal points,
    // which reduce their penalized amount, if they face a report in future
    function report(
        address _royalValidator,
        address _reportedValidator
    )
        external
        reportable(_reportedValidator)
        noJoinLeaveBefore()
    {
        uint expectedPenalizedAmount = _report(_royalValidator, _reportedValidator, safeRange(), penalizedBase());
        uint penalizedAmount = preparePenalize(_reportedValidator, expectedPenalizedAmount);
        // penalizedAmount from frozen will be  distributed to sealers
        _reduceFrozenBalance(_reportedValidator, penalizedAmount);
        _distributePenalize(_reportedValidator, penalizedAmount);

        emit Penalized(_reportedValidator, penalizedAmount);
        lastJoinLeaveBlock = block.number;
    }

    // Validator's Actions

    // stake coin and received RVS Token with rate 1:1
    // more RVS Token means more reward shared
    function stake(
        address _validator
    )
        external
        payable
        onlyValidator()
        isNotSlashed()
    {
        uint _amount = msg.value;
        _stake(_validator, _amount);
    }

    // stake direct from validator's wallet
    function stake()
        external
        payable
        onlyValidator()
        isNotSlashed()
    {
        stake(msg.sender);
    }

    // _validator is checked in _addValidator
    // revert if already exist
    function join(
        address _coinbase
    )
        external
        payable
        isNotSlashed()
        joinable()
        noJoinLeaveBefore()
    {
        address _validator = msg.sender;
        uint _amount = msg.value;
        _stake(_validator, _amount);
        require(balanceOf(_validator) >= stakeRequired(), "stake not enough");
        _addValidator(_validator, _coinbase);
        lastJoinLeaveBlock = block.number;
    }

    function leave()
        external
        onlyValidator()
        notLocked()
        noJoinLeaveBefore()
    {
        address _validator = msg.sender;
        uint toFrozenAmount = _leave(_validator);
        _pushToFrozen(_validator, toFrozenAmount);
        _removeValidator(_validator);
        lastJoinLeaveBlock = block.number;
    }

    function claim(
    )
        external
        onlyValidator()
    {
        address _validator = msg.sender;
        uint toFrozenAmount = _claim(_validator);
        _pushToFrozen(_validator, toFrozenAmount);
    }

    function unstake(
        uint _amount
    )
        external
        onlyValidator()
    {
        address _validator = msg.sender;
        uint toFrozenAmount = _unstake(_validator, _amount);
        _pushToFrozen(_validator, toFrozenAmount);
    }

    function cashout(
        uint _amount
    )
        external
        notLocked()
    {
        _distribute();
        address payable _validator = msg.sender;
        _cashout(_validator, _amount);
        _updateLastBalance();
    }

    // Internal Functions

    function _addValidator(
        address _validator,
        address _coinbase
    )
        internal
        onlyNotValidator(_validator)
        onlyNotCoinbase(_coinbase)
    {
        coinbasePosition[_coinbase] = count();

        coinbases.push(_coinbase);
        validatorCoinbases[_validator] = _coinbase;
        coinbaseValidators[_coinbase] = _validator;
        emit Joined(_validator, _coinbase, balanceOf(_validator));
        _lock(_validator, lockRange() + block.number);
        _startTimer(_validator);
    }

    function _removeCoinbase(
        address _coinbase
    )
        internal
    {
        uint pos = coinbasePosition[_coinbase];
        address lastCoinbase = coinbases[count() - 1];
        coinbasePosition[lastCoinbase] = pos;
        coinbases[pos] = lastCoinbase;
        coinbases.length--;
        coinbaseValidators[_coinbase] = ZERO_ADDRESS;
    }

    function _removeValidator(
        address _validator
    )
        internal
    {
        address _coinbase = validatorCoinbases[_validator];
        _removeCoinbase(_coinbase);
        validatorCoinbases[_validator] = ZERO_ADDRESS;
        _resetTimer(_validator);
        emit Left(_validator, _coinbase);
        require(count() >= 3, "concensus works with at least 3 validators");
    }

    function _pushToFrozen(
        address _validator,
        uint _amount
    )
        internal
    {
        _addFrozenBalance(_validator, _amount);
        _lock(_validator, lockRange() + block.number);
    }

    // View Functions

    function isValidator(
        address _validator
    )
        public
        view
        returns(bool)
    {
        return validatorCoinbases[_validator] != ZERO_ADDRESS;
    }

    function isCoinbase(
        address _coinbase
    )
        public
        view
        returns(bool)
    {
        return coinbaseValidators[_coinbase] != ZERO_ADDRESS;
    }

    function count()
        public
        view
        returns(uint)
    {
        return coinbases.length;
    }

    function lockRange()
        public
        view
        returns(uint)
    {
        return 10 * count();
    }

    function safeRange()
        public
        view
        returns(uint)
    {
        return 2 * count();
    }

    function penalizedBase()
        public
        view
        returns(uint)
    {
        return totalSupply() / count() / 10;
    }

    function stakeRequired()
        public
        view
        returns(uint)
    {
        return coinSupply() / VALIDATOR_STAKE_RATE;
    }

    /*
        RCOIN SUPPLY
    */
    function burned()
        public
        view
        returns(uint)
    {
        return address(0x0).balance;
    }
    function coinSupply(
    )
        public
        view
        returns(uint)
    {
        return getPremineSum() + _coinSupplyExcludedPremine() - burned();
    }

    /*
        Explorer's functions
    */

    function getValidators()
        external
        view
        returns(address[] calldata)
    {
        // blockscout queries with coinbases instead of validators
        return coinbases;
    }

    function getValidatorName(
        address _coinbase
    )
        external
        view
        returns(
            bytes32 firstName,
            bytes32 lastName
        )
    {
        address _validator = coinbaseValidators[_coinbase];
        return _getValidatorName(_validator);
    }

    function validators(
        address _coinbase
    )
        external
        view
        returns (
            bytes32 firstName,
            bytes32 lastName,
            bytes32 licenseId,
            string calldata fullAddress,
            bytes32 state,
            bytes32 zipcode,
            uint expirationDate,
            uint createdDate,
            uint updatedDate,
            uint minThreshold,
            bytes32 contactEmail,
            bool isCompany
        )
    {
        address _validator = coinbaseValidators[_coinbase];
        return _validators(_validator);
    }

    function updateMetadata(
        bytes32 _firstName,
        bytes32 _lastName,
        bytes32 _licenseId,
        string calldata _fullAddress,
        bytes32 _state,
        bytes32 _zipcode,
        uint _expirationDate,
        uint _createdDate,
        uint _updatedDate,
        uint _minThreshold,
        bytes32 _contactEmail,
        bool _isCompany
    )
        external
        onlyValidator()
    {
        address _validator = msg.sender;
        _updateMetadata(
            _validator,
            _firstName,
            _lastName,
            _licenseId,
            _fullAddress,
            _state,
            _zipcode,
            _expirationDate,
            _createdDate,
            _updatedDate,
            _minThreshold,
            _contactEmail,
            _isCompany
        );
    }

    /*
        TEST LOCAL NETWORK
    */
    // function mining(
    //     address _coinbase
    // )
    //     public
    //     payable
    // {
    //     // address _coinbase = block.coinbase;
    //     address _validator = coinbaseValidators[_coinbase];
    //     _submitProof(_validator);
    // }
}
