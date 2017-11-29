pragma solidity ^0.4.15;

import "./EthearnalRepToken.sol";
import "./VotingProxy.sol";
import "./IBallot.sol";

contract RefundInvestorsBallot is IBallot {

    uint256 public initialQuorumPercent = 51;
    uint256 public requiredMajorityPercent = 65;

    function RefundInvestorsBallot(address _tokenContract) {
        tokenContract = EthearnalRepToken(_tokenContract);
        proxyVotingContract = VotingProxy(msg.sender);
        ballotStarted = getTime();
        isVotingActive = true;
    }

    function decide() internal {
        uint256 quorumPercent = getQuorumPercent();
        uint256 quorum = quorumPercent.mul(tokenContract.totalSupply()).div(100);
        uint256 soFarVoted = yesVoteSum.add(noVoteSum);
        if (soFarVoted >= quorum) {
            uint256 percentYes = (100 * yesVoteSum).div(soFarVoted);
            if (percentYes >= requiredMajorityPercent) {
                // does not matter if it would be greater than weiRaised
                proxyVotingContract.proxyEnableRefunds();
                FinishBallot(now);
                isVotingActive = false;
            } else {
                // do nothing, just deactivate voting
                isVotingActive = false;
            }
        }
    }
    
    function getQuorumPercent() public constant returns (uint256) {
        uint256 isMonthPassed = getTime().sub(ballotStarted).div(5 weeks);
        if(isMonthPassed == 1){
            return 0;
        }
        return initialQuorumPercent;
    }
    
}