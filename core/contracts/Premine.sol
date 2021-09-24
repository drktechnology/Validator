pragma solidity ^0.5.0;

import "./openzeppelin/SafeMath.sol";
import "./openzeppelin/RVSToken.sol";

// base https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol

contract Premine {
    using SafeMath for uint;

    // premine from genesis block
    uint internal premineSum;
    address[] public premineAddresses;
    uint[] public premineBalances;

    function _addPremine(
        address _premineAddress,
        uint _premineBalance
    )
        internal
    {
        premineAddresses.push(_premineAddress);
        premineBalances.push(_premineBalance);
        premineSum += _premineBalance;
    }

    function getPremineSum()
        public
        view
        returns(uint)
    {
        return premineSum;
    }

    function getPremineAddressesCount()
        external
        view
        returns(uint)
    {
        return premineAddresses.length;
    }

    function getPremineAccount(
        uint i
    )
        external
        view
        returns(address, uint)
    {
        return (premineAddresses[i], premineBalances[i]);
    }
}