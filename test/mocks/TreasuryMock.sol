pragma solidity ^0.4.15;

import '../../contracts/Treasury.sol';


contract TreasuryMock is Treasury {
    uint256 public weiRaised = 0;
    function TreasuryMock(address _teamWallet, address _votingProxyContract) public 
        Treasury(_teamWallet, _votingProxyContract)
    {
    }
    function getWeiRaised() public constant returns(uint256) {
       return this.balance;
    }
}
