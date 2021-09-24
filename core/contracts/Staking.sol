pragma solidity ^0.5.0;

import "./openzeppelin/SafeMath.sol";
import "./openzeppelin/RVSToken.sol";

// base https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol

contract Staking is RVSToken {
    using SafeMath for uint;

    //CPT ZOOMED
    uint constant public CPT_ZOOM = 2**40;

    mapping(address => uint) private credit;

    // coin per token
    uint private cpt;
    uint private lastBalance;
    uint internal _coinSupply;

    event Staked(address indexed _validator, uint _amount, uint _stake);
    event Unstaked(address indexed _validator, uint _amount, uint _stake);
    event Claimed(address indexed _validator, uint _amount);

    event CptUpdated(uint indexed _cpt);
    event CreditUpdated(address indexed _validator, uint indexed _credit);
    event LastBalanceUpdated(uint indexed _lastBalance);

    constructor (
        string memory name,
        string memory symbol,
        uint8 decimals
    )
        public
        RVSToken(name, symbol, decimals)
    {
    }

    // this is used in _stake too.
    function _setLastBalance(
        uint _lastBalance
    )
        internal
    {
        lastBalance = _lastBalance;
        emit LastBalanceUpdated(_lastBalance);
    }

    function _updateLastBalance()
        internal
    {
        _setLastBalance(address(this).balance);
    }

    // if totalSupply, network should be stopped before
    function _distribute()
        internal
    {
        if (address(this).balance <= lastBalance) return;
        uint _addedBalance = address(this).balance - lastBalance;
        _coinSupply += _addedBalance;

        uint _addedCpt = _addedBalance.mul(CPT_ZOOM) / totalSupply();
        cpt = cpt.add(_addedCpt);
        _updateLastBalance();
        emit CptUpdated(cpt);
    }

    function _distributePenalize(
        address _reportedValidator,
        uint _penalizedAmount
    )
        internal
    {
        uint _sharedSupply = totalSupply() - balanceOf(_reportedValidator);
        // this should never happen
        if (_sharedSupply == 0) {
            uint _addedCpt = _penalizedAmount.mul(CPT_ZOOM) / totalSupply();
            cpt = cpt.add(_addedCpt);
            emit CptUpdated(cpt);
            return;
        }
        uint _addedCpt = _penalizedAmount.mul(CPT_ZOOM) / _sharedSupply;
        uint _reportedValidatorReward = _rewardOf(_reportedValidator);
        cpt = cpt.add(_addedCpt);
        _setCredit(_reportedValidator, _reportedValidatorReward);
        emit CptUpdated(cpt);
    }

    function _claim(
        address _validator
    )
        internal
        returns(uint)
    {
        _distribute();
        uint _amount = _rewardOf(_validator);
        _setCredit(_validator, 0);
        emit Claimed(_validator, _amount);
        return _amount;
        // move _amount to wallet after this step
    }

    function _stake(
        address _validator,
        uint _amount
    )
        internal
    {
        // _amount is staked coin to exchange in RVS token, so wont be shared
        _setLastBalance(lastBalance + _amount);
        _distribute();
        uint _currentReward = _rewardOf(_validator);
        _mint(_validator, _amount);
        _setCredit(_validator, _currentReward);
        emit Staked(_validator, _amount, balanceOf(_validator));
    }

    function _unstake(
        address _validator,
        uint _amount
    )
        internal
        returns(uint)
    {
        uint rewardAmount = _claim(_validator);
        _burn(_validator, _amount);
        _setCredit(_validator, 0);
        uint toWalletAmount = rewardAmount + _amount;
        emit Unstaked(_validator, _amount, balanceOf(_validator));
        return toWalletAmount;
    }

    // claim whole reward + RVS Token
    function _leave(
        address _validator
    )
        internal
        returns(uint)
    {
        uint RVSBalance = balanceOf(_validator);
        uint toWalletAmount = _unstake(_validator, RVSBalance);
        return toWalletAmount;
    }

    function _rewardOf(
        address _validator
    )
        internal
        view
        returns(uint)
    {
        uint tmp = balanceOf(_validator).mul(cpt) / CPT_ZOOM;
        if (tmp < credit[_validator]) {
            return 0;
        }
        uint reward = tmp - credit[_validator];
        return reward;
    }

    /*
        credit balancing to reach target Reward
    */
    function _setCredit(
        address _validator,
        uint _targetReward
    )
        internal
    {
        uint tmp = balanceOf(_validator).mul(cpt) / CPT_ZOOM;
        credit[_validator] = tmp.sub(_targetReward);
        emit CreditUpdated(_validator, credit[_validator]);
    }

    function rewardOf(
        address _validator
    )
        external
        view
        returns(uint)
    {
        uint tmp = balanceOf(_validator).mul(getCpt()) / CPT_ZOOM;
        if (tmp < credit[_validator]) {
            return 0;
        }
        uint reward = tmp - credit[_validator];
        return reward;
    }

    // address(this).balance always greater aqual lastBalance.
    // all actions to reduce address(this).balance will call update last balance
    function getCpt()
        public
        view
        returns(uint)
    {
        uint _addedBalance = address(this).balance - lastBalance;
        uint _addedCpt = _addedBalance.mul(CPT_ZOOM) / totalSupply();
        return cpt + _addedCpt;
    }

    /*
        RET COIN SUPPLY EXCLUDED PREMINE AMOUNT FROM GENESIS
    */
    function _coinSupplyExcludedPremine()
        internal
        view
        returns(uint)
    {
        uint _toAdded = address(this).balance > lastBalance ? address(this).balance - lastBalance : 0;
        return _coinSupply + _toAdded;
    }
}