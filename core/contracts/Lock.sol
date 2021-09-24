pragma solidity ^0.5.0;

import "./openzeppelin/SafeMath.sol";

/**
 * @title drkchain validators lock smart contract
 */
contract Lock {

    modifier isNotSlashed() {
        require(statusOf(msg.sender) != ValidatorStatus.SLASHED, "validator is slashed");
        _;
    }

    modifier notLocked() {
        require(statusOf(msg.sender) == ValidatorStatus.NOT_LOCKED, "validator is locked or slashed");
        _;
    }

    enum ValidatorStatus {
        // Withdrawable and joinable
        NOT_LOCKED,

        // unwithdrawable but joinable
        LOCKED,

        // unwithdrawable nor joinable
        SLASHED
    }

    event Slashed(address indexed _validator);
    event Locked(address indexed _validator, uint indexed _unlockedAt);

    uint constant public SLASHED_BLOCK = 2**255;

    mapping (address => uint) public unlockedAt;

    function _lock(address _validator, uint _unlockedAt) internal {
        require(_unlockedAt > block.number, "invalid unlocked block");
        unlockedAt[_validator] = _unlockedAt;
        emit Locked(_validator, _unlockedAt);
    }

    function _slash(address _validator) internal {
        unlockedAt[_validator] = SLASHED_BLOCK;
        emit Slashed(_validator);
    }

    function _unlock(address _validator) internal {
        unlockedAt[_validator] = 0;
    }

    function statusOf(address _validator) public view returns(ValidatorStatus) {
        uint unlockedBlock = unlockedAt[_validator];
        if (unlockedBlock < block.number) {
            return ValidatorStatus.NOT_LOCKED;
        } else {
            if (unlockedBlock != SLASHED_BLOCK) {
                return ValidatorStatus.LOCKED;
            } else {
                return ValidatorStatus.SLASHED;
            }
        }
    }
}