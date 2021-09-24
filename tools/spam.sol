pragma solidity ^0.5.0;

contract Test {
    function() external payable {
        uint gasLimit = msg.value - 11000;
        uint loop = gasLimit / 58;
        // uint loop = 10000;
        // 581091
        uint i = 0;
        for (i=0; i < loop; i++) {
            
        } 
    }
    //82820000
}