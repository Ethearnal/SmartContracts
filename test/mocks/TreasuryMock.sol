pragma solidity ^0.4.15;

import '../../contracts/Treasury.sol';


contract TreasuryMock is Treasury {

    function TreasuryMock(
        address _teamWallet
    )
        Treasury(_teamWallet)
    {
        // emptiness
    }
    uint256 public weiRaised = 0;

    function () public payable {
        weiRaised += msg.value;
    }

    function getWeiRaised() public returns(uint256) {
        return weiRaised;
    }

}
