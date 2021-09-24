pragma solidity ^0.5.0;
import "./openzeppelin/SafeMath.sol";

/**
 * @title drkchain validator's penalize smart contract
 */
contract Penalize {
    using SafeMath for uint;

    modifier onlyCoinbase() {
        require(msg.sender == block.coinbase, "Sender is not coinbase");
        _;
    }

    modifier onlyValidReport(address _reportedValidator, uint _safeRange) {
        require(startTimerAtBlock[_reportedValidator] > 0, "timer not started");
        require(startTimerAtBlock[_reportedValidator] + _safeRange < block.number, "too early too be penalized");
        // require(lastSealedBlock[_reportedValidator] + _safeRange < block.number, "still in acceptable range from last sealed block");
        // require(lastPenalizedBlock[_reportedValidator] + _safeRange < block.number, "too early too be penalized again");
        _;
    }

    event ProofSubmitted(address indexed _validator);
    event PointUpdated(address indexed _validator, uint _point);
    event StartTimer(address indexed _validator);

    // every BLOCKS_PER_ROYALTY sealed blocks, validator received a royalty point
    uint constant public BLOCKS_PER_ROYALTY = 10;
    uint constant public ROYALTY_STACK_LIMIT = 3;

    // mapping(address => uint) private lastSealedBlock;
    // mapping(address => uint) private lastPenalizedBlock;
    mapping(address => uint) private startTimerAtBlock;
    mapping(address => uint) private royaltyPoint;
    mapping(address => uint) private sealedBlocks;
    mapping(address => uint) private penalizedTimes;

    function _addRoyalty(
        address _validator
    )
        internal
    {
        // points stacked full, not add anymore
        if (royaltyPoint[_validator] >= penalizedTimes[_validator] + ROYALTY_STACK_LIMIT) {
            return;
        }
        royaltyPoint[_validator]++;
        emit PointUpdated(_validator, royaltyPoint[_validator]);
    }

    function _resetTimer(
        address _validator
    )
        internal
    {
        startTimerAtBlock[_validator] = 0;
        // points stacked will be lost
        royaltyPoint[_validator] = penalizedTimes[_validator];
    }

    function _startTimer(
        address _validator
    )
        internal
    {
        startTimerAtBlock[_validator] = block.number;
        emit StartTimer(_validator);
    }

    function _submitProof(
        address _validator
    )
        internal
    {
        // require(lastSealedBlock[_validator] < block.number, "already submited");
        // lastSealedBlock[_validator] = block.number;
        require(startTimerAtBlock[_validator] < block.number, "already submited");
        _startTimer(_validator);
        sealedBlocks[_validator]++;
        if (sealedBlocks[_validator] % BLOCKS_PER_ROYALTY == 0) {
            _addRoyalty(_validator);
        }
        emit ProofSubmitted(_validator);
    }

    // return amount to be penalized, if not reverted
    function _report(
        address _royalValidator,
        address _reportedValidator,
        uint _safeRange,
        uint _penalizedBase
    )
        internal
        // onlyCoinbase()
        onlyValidReport(_reportedValidator, _safeRange)
        returns(uint)
    {
        // self reports are welcome, and better than reported by someone else
        // add royal point for reporter, which saves himself in future
        _addRoyalty(_royalValidator);
        // prevent to be reported again
        // lastPenalizedBlock[_reportedValidator] = block.number;
        _startTimer(_reportedValidator);
        penalizedTimes[_reportedValidator]++;
        if (royaltyPoint[_reportedValidator] >= penalizedTimes[_reportedValidator]) {
            return _penalizedBase;
        }
        uint expo = penalizedTimes[_reportedValidator] - royaltyPoint[_reportedValidator];
        return _penalizedBase * (2 ** expo);
    }
}