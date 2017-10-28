pragma solidity ^0.4.15;

import './Treasury.sol';
import './Ballot.sol';
import './RefundInvestorsBallot.sol';
import "./EthearnalRepToken.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract VotingProxy is Ownable {
    using SafeMath for uint256;    
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
            require(getDaysPassedSinceLastTeamFundsBallot() > 2);
            currentIncreaseWithdrawalTeamBallot =  new Ballot(tokenContract);
        }
    }

    function startRefundInvestorsBallot() public {
        require(treasuryContract.isCrowdsaleFinished());
        require(address(currentIncreaseWithdrawalTeamBallot) == 0x0 || currentIncreaseWithdrawalTeamBallot.isVotingActive() == false);
        if(address(currentRefundInvestorsBallot) == 0x0) {
            currentRefundInvestorsBallot =  new RefundInvestorsBallot(tokenContract);
        } else {
            require(getDaysPassedSinceLastRefundBallot() > 2);
            currentRefundInvestorsBallot =  new RefundInvestorsBallot(tokenContract);
        }
    }

    function getDaysPassedSinceLastRefundBallot() public constant returns(uint256) {
        return getTime().sub(currentRefundInvestorsBallot.ballotStarted()).div(1 days);
    }

    function getDaysPassedSinceLastTeamFundsBallot() public constant returns(uint256) {
        return getTime().sub(currentIncreaseWithdrawalTeamBallot.ballotStarted()).div(1 days);
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

    function getTime() internal returns (uint256) {
        // Just returns `now` value
        // This function is redefined in EthearnalRepTokenCrowdsaleMock contract
        // to allow testing contract behaviour at different time moments
        return now;
    }


}