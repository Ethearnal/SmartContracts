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

    function getTime() internal returns (uint256) {
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

    function getCurrentStateProxy() public returns (State) {
        return super.getCurrentState();
    }

    function getStateForTimeProxy(uint256 unixTime) public returns (State) {
        return super.getStateForTime(unixTime);
    }

    function getWeiAllowedFromAddressProxy(address _sender) public returns (uint256) {
        return super.getWeiAllowedFromAddress(_sender);
    }

    function minProxy(uint256 a, uint256 b) public returns (uint256) {
        return super.min(a, b);
    }

    function maxProxy(uint256 a, uint256 b) public returns (uint256) {
        return super.max(a, b);
    }

    function ceilProxy(uint a, uint b) public returns (uint) {
        return super.ceil(a, b);
    }

    function isReadyToFinalizeProxy() public returns (bool) {
        return super.isReadyToFinalize();
    }

    function getTokenAmountForEtherProxy(uint256 weiAmount) public returns (uint256) {
        return super.getTokenAmountForEther(weiAmount);
    }

    function getTokenRateEtherProxy() public returns (uint256) {
        return super.getTokenRateEther();
    }

    function convertUsdToEtherProxy(uint256 usdAmount) public returns (uint256) {
        return super.convertUsdToEther(usdAmount);
    }
}
