pragma solidity ^0.4.15;

import '../../contracts/Treasury.sol';


contract TreasuryMock is Treasury {
    uint256 public weiRaised = 0;
    function TreasuryMock(address _teamWallet) public 
        Treasury(_teamWallet)
    {
    }
    function getWeiRaised() public constant returns(uint256) {
       return this.balance;
    }

    function setRefundsEnabled(bool _status) public {
        isRefundsEnabled = _status;
    }
}
