pragma solidity ^0.4.15;

import './Treasury.sol';
import './Ballot.sol';
import './RefundInvestorsBallot.sol';
import "./EthearnalRepToken.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import "zeppelin-solidity/contracts/token/ERC20Basic.sol";

contract VotingProxy is Ownable {
    using SafeMath for uint256;    
    Treasury public treasuryContract;
    EthearnalRepToken public tokenContract;
    Ballot public currentIncreaseWithdrawalTeamBallot;
    RefundInvestorsBallot public currentRefundInvestorsBallot;

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

    function proxyIncreaseWithdrawalChunk() public {
        require(msg.sender == address(currentIncreaseWithdrawalTeamBallot));
        treasuryContract.increaseWithdrawalChunk();
    }

    function proxyEnableRefunds() public {
        require(msg.sender == address(currentRefundInvestorsBallot));
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

    function claimTokens(address _token) public onlyOwner {
        if (_token == 0x0) {
            owner.transfer(this.balance);
            return;
        }
    
        ERC20Basic token = ERC20Basic(_token);
        uint256 balance = token.balanceOf(this);
        token.transfer(owner, balance);
    }

}