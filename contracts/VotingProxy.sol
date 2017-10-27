pragma solidity ^0.4.15;

import './Treasury.sol';
import './Ballot.sol';
import "./EthearnalRepToken.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract VotingProxy is Ownable {
    Treasury public treasuryContract;
    EthearnalRepToken public tokenContract;
    Ballot public currentIncreaseWithdrawalTeamBallot;

    function  VotingProxy(address _treasuryContract, address _tokenContract) {
        treasuryContract = Treasury(_treasuryContract);
        tokenContract = EthearnalRepToken(_tokenContract);
    }

    function startincreaseWithdrawalTeam() onlyOwner {
        if(address(currentIncreaseWithdrawalTeamBallot) == 0x0) {
            currentIncreaseWithdrawalTeamBallot =  new Ballot(tokenContract, treasuryContract);
        } else {
            require(currentIncreaseWithdrawalTeamBallot.isVotingActive() == false);
            currentIncreaseWithdrawalTeamBallot =  new Ballot(tokenContract, treasuryContract);
        }
    }

    function() {
        revert();
    }
}