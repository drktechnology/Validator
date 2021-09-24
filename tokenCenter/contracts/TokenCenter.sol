pragma solidity ^0.5.0;

import "./Token.sol";

contract TokenCenter {
    event NewToken(
        address indexed _creator,
        address _tokenAddress,
        string _name,
        string _symbol,
        uint8 _decimals,
        uint _premine,
        bool _pausable
    );

    function issue(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint _premine,
        bool _pausable
    )
        public
    {
        Token newToken = new Token(_name, _symbol, _decimals, _premine, _pausable);
        emit NewToken(msg.sender, address(newToken), _name, _symbol, _decimals, _premine, _pausable);
    }
}