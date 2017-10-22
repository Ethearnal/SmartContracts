pragma solidity ^0.4.15;

import './EthearnalRepTokenCrowdsale.sol';


contract EthearnalRepTokenCrowdsaleMock is EthearnalRepTokenCrowdsale {
    uint256 mockTime = 0;

    function EthearnalRepTokenCrowdsaleMock(
        address[] _owners,
        address _token,
        address _treasuryWallet,
        address _teamTokenWallet
    )
        EthearnalRepTokenCrowdsale(_owners, _token, _treasuryWallet, _teamTokenWallet)
    {
        // emptiness
    }

    // Debug method to redefine current time
    function setTime(uint256 _time) public {
        mockTime = _time;
    }

    function getTime() private returns (uint256) {
        if (mockTime != 0) {
            return mockTime;
        } else {
            return now;
        } 
    }

    // Debug method to redefine hard cap
    function setSaleCapUsd(uint256 _usdAmount) public {
        saleCapUsd = _usdAmount;
    }
}
