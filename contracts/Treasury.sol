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

    // Amount of ether that could be withdrawed each withdraw iteration
    uint256 public withdrawChunk = 0;
    VotingProxy public votingProxyContract;


    event Deposit(uint256 amount);

    function Treasury(address _teamWallet, address _votingProxyContract) public {
        require(_teamWallet != 0x0);
        require(_votingProxyContract != 0x0);
        // TODO: check address integrity
        teamWallet = _teamWallet;
        votingProxyContract = VotingProxy(_votingProxyContract);
    }

    // TESTED
    function() public payable {
        require(msg.sender == address(crowdsaleContract));
        Deposit(msg.value);
    }

    // TESTED
    function setCrowdsaleContract(address _address) public onlyOwner {
        // Could be set only once
        require(crowdsaleContract == address(0x0));
        require(_address != 0x0);
        crowdsaleContract = EthearnalRepTokenCrowdsale(_address); 
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
        weiWithdrawed = weiUnlocked;
        teamWallet.transfer(weiUnlocked.sub(weiWithdrawed));
    }

    function getWeiRaised() public returns(uint256) {
       return crowdsaleContract.weiRaised();
    }

    function increaseWithdrawalChunk() {
        require(msg.sender == address(votingProxyContract));
        weiUnlocked = weiUnlocked.add(withdrawChunk);
    }

    function getTime() internal returns (uint256) {
        // Just returns `now` value
        // This function is redefined in EthearnalRepTokenCrowdsaleMock contract
        // to allow testing contract behaviour at different time moments
        return now;
    }
}
