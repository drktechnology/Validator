pragma solidity ^0.5.0;
import "./openzeppelin/SafeMath.sol";

/**
 * @title drkchain validator's frozen smart contract
 */
contract Frozen {
    using SafeMath for uint;

    event FrozenIncreased(address indexed _validator, uint _amount, uint _frozenBalance);
    event FrozenDecreased(address indexed _validator, uint _amount, uint _frozenBalance);
    event Cashout(address indexed _validator, uint _amount, uint _frozenBalance);

    // validator's frozen balance
    mapping(address => uint) private frozenBalances;

    function _addFrozenBalance(
        address _validator,
        uint _amount
    )
        internal
    {
        frozenBalances[_validator] = frozenBalances[_validator].add(_amount);
        emit FrozenIncreased(_validator, _amount, frozenBalances[_validator]);
    }

    function _reduceFrozenBalance(
        address _validator,
        uint _amount
    )
        internal
    {
        frozenBalances[_validator] = frozenBalances[_validator].sub(_amount);
        emit FrozenDecreased(_validator, _amount, frozenBalances[_validator]);
    }

    function _cashout(
        address payable _validator,
        uint _amount
    )
        internal
    {
        // ignore FDT-01
        _reduceFrozenBalance(_validator, _amount);
        _validator.transfer(_amount);
        emit Cashout(_validator, _amount, frozenBalances[_validator]);
    }

    function getFrozenBalance(
        address _validator
    )
        public
        view
        returns(uint)
    {
        return frozenBalances[_validator];
    }
}