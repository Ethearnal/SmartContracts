pragma solidity ^0.4.15;

import './MultiOwnable.sol';
import './EthearnalRepTokenCrowdsale.sol';
import './EthearnalRepToken.sol';
import './VotingProxy.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract Treasury is MultiOwnable {
    using SafeMath for uint256;

    // Total amount of ether withdrawed
    uint256 public weiWithdrawed = 0;

    // Total amount of ther unlocked
    uint256 public weiUnlocked = 0;

    // Wallet withdraw is locked till end of crowdsale
    bool public isCrowdsaleFinished = false;

    // Withdrawed team funds go to this wallet
    address teamWallet = 0x0;

    // Crowdsale contract address
    EthearnalRepTokenCrowdsale public crowdsaleContract;
    EthearnalRepToken public tokenContract;
    bool public isRefundsEnabled = false;

    // Amount of ether that could be withdrawed each withdraw iteration
    uint256 public withdrawChunk = 0;
    VotingProxy public votingProxyContract;


    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event UnlockWei(uint256 amount);
    event RefundedInvestor(address investor, uint256 amountRefunded, uint256 tokensBurn);

    function Treasury(address _teamWallet) public {
        require(_teamWallet != 0x0);
        // TODO: check address integrity
        teamWallet = _teamWallet;
    }

    // TESTED
    function() public payable {
        require(msg.sender == address(crowdsaleContract));
        Deposit(msg.value);
    }

    function setVotingProxy(address _votingProxyContract) public onlyOwner {
        require(votingProxyContract == address(0x0));
        votingProxyContract = VotingProxy(_votingProxyContract);
    }

    // TESTED
    function setCrowdsaleContract(address _address) public onlyOwner {
        // Could be set only once
        require(crowdsaleContract == address(0x0));
        require(_address != 0x0);
        crowdsaleContract = EthearnalRepTokenCrowdsale(_address); 
    }

    function setTokenContract(address _address) public onlyOwner {
        // Could be set only once
        require(tokenContract == address(0x0));
        require(_address != 0x0);
        tokenContract = EthearnalRepToken(_address);
    }

    // TESTED
    function setCrowdsaleFinished() public {
        require(crowdsaleContract != address(0x0));
        require(msg.sender == address(crowdsaleContract));
        withdrawChunk = getWeiRaised().div(10);
        weiUnlocked = withdrawChunk;
        isCrowdsaleFinished = true;
    }

    // TESTED
    function withdrawTeamFunds() public onlyOwner {
        require(isCrowdsaleFinished);
        require(weiUnlocked > weiWithdrawed);
        uint256 toWithdraw = weiUnlocked.sub(weiWithdrawed);
        weiWithdrawed = weiUnlocked;
        teamWallet.transfer(toWithdraw);
        Withdraw(weiUnlocked.sub(weiWithdrawed));
    }

    function getWeiRaised() public constant returns(uint256) {
       return crowdsaleContract.weiRaised();
    }

    function increaseWithdrawalChunk() {
        require(isCrowdsaleFinished);
        require(msg.sender == address(votingProxyContract));
        weiUnlocked = weiUnlocked.add(withdrawChunk);
        UnlockWei(weiUnlocked);
    }

    function getTime() internal returns (uint256) {
        // Just returns `now` value
        // This function is redefined in EthearnalRepTokenCrowdsaleMock contract
        // to allow testing contract behaviour at different time moments
        return now;
    }

    function enableRefunds() public {
        require(msg.sender == address(votingProxyContract));
        isRefundsEnabled = true;
    }
    
    function refundInvestor(uint256 _tokensToBurn) public {
        require(isRefundsEnabled);
        require(address(tokenContract) != address(0x0));
        uint256 tokenRate = crowdsaleContract.getTokenRateEther();
        uint256 toRefund = tokenRate.mul(_tokensToBurn).div(1 ether);
        uint256 percentLeft = percentLeftFromTotalRaised().mul(100*1000).div(1 ether);
        toRefund = toRefund.mul(percentLeft).div(100*1000);
        require(toRefund > 0);
        tokenContract.burnFrom(msg.sender, _tokensToBurn);
        msg.sender.transfer(toRefund);
        RefundedInvestor(msg.sender, toRefund, _tokensToBurn);
    }

    function percentLeftFromTotalRaised() public constant returns(uint256) {
        return percent(this.balance, getWeiRaised(), 18);
    }

    function percent(uint numerator, uint denominator, uint precision) internal constant returns(uint quotient) {
        // caution, check safe-to-multiply here
        uint _numerator  = numerator * 10 ** (precision+1);
        // with rounding of last digit
        uint _quotient =  ((_numerator / denominator) + 5) / 10;
        return ( _quotient);
    }
}
