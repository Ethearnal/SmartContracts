pragma solidity ^0.4.15;

import './Treasury.sol';
import './Ballot.sol';
import './RefundInvestorsBallot.sol';
import "./EthearnalRepToken.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract VotingProxy is Ownable {
    Treasury public treasuryContract;
    EthearnalRepToken public tokenContract;
    Ballot public currentIncreaseWithdrawalTeamBallot;
    RefundInvestorsBallot public currentRefundInvestorsBallot;

    modifier onlyBallot() {
        require(msg.sender == address(currentIncreaseWithdrawalTeamBallot) ||
                msg.sender == address(currentRefundInvestorsBallot)
        );
        _;
    }

    function  VotingProxy(address _treasuryContract, address _tokenContract) {
        treasuryContract = Treasury(_treasuryContract);
        tokenContract = EthearnalRepToken(_tokenContract);
    }

    function startincreaseWithdrawalTeam() onlyOwner {
        require(treasuryContract.isCrowdsaleFinished());
        require(address(currentRefundInvestorsBallot) == 0x0 || currentRefundInvestorsBallot.isVotingActive() == false);
        if(address(currentIncreaseWithdrawalTeamBallot) == 0x0) {
            currentIncreaseWithdrawalTeamBallot =  new Ballot(tokenContract);
        } else {
            require(currentIncreaseWithdrawalTeamBallot.isVotingActive() == false);
            currentIncreaseWithdrawalTeamBallot =  new Ballot(tokenContract);
        }
    }

    function startRefundInvestorsBallot() public {
        require(treasuryContract.isCrowdsaleFinished());
        require(address(currentIncreaseWithdrawalTeamBallot) == 0x0 || currentIncreaseWithdrawalTeamBallot.isVotingActive() == false);
        if(address(currentRefundInvestorsBallot) == 0x0) {
            currentRefundInvestorsBallot =  new RefundInvestorsBallot(tokenContract);
        } else {
            require(currentRefundInvestorsBallot.isVotingActive() == false);
            currentRefundInvestorsBallot =  new RefundInvestorsBallot(tokenContract);
        }
    }

    function proxyIncreaseWithdrawalChunk() onlyBallot {
        treasuryContract.increaseWithdrawalChunk();
    }

    function proxyEnableRefunds() onlyBallot {
        treasuryContract.enableRefunds();
    }

    function() {
        revert();
    }
}