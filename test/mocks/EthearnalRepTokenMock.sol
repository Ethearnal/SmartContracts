pragma solidity ^0.4.15;

import '../../contracts/EthearnalRepToken.sol';


contract EthearnalRepTokenMock is EthearnalRepToken {
    uint256 mockTime = 0;
    // Debug method to redefine current time
    function setTime(uint256 _time) public {
        mockTime = _time;
    }

    function getTime() internal returns (uint256) {
        if (mockTime != 0) {
            return mockTime;
        } else {
            return now;
        } 
    }
}
