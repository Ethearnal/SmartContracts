pragma solidity ^0.4.15;

import "./EthearnalRepToken.sol";
import "./VotingProxy.sol";
import "./IBallot.sol";

contract Ballot is IBallot {

    uint256 public initialQuorumPercent = 51;

    function Ballot(address _tokenContract) {
        tokenContract = EthearnalRepToken(_tokenContract);
        proxyVotingContract = VotingProxy(msg.sender);
    }
    
    function getQuorumPercent() public constant returns (uint256) {
        require(isVotingActive);
        // find number of full weeks alapsed since voting started
        uint256 weeksNumber = getTime().sub(ballotStarted).div(1 weeks);
        if(weeksNumber == 0) {
            return initialQuorumPercent;
        }
        if (initialQuorumPercent < weeksNumber * 10) {
            return 0;
        } else {
            return initialQuorumPercent.sub(weeksNumber * 10);
        }
    }
    
}