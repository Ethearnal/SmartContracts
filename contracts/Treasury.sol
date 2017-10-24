pragma solidity ^0.4.15;

import './MultiOwnable.sol';
import './EthearnalRepTokenCrowdsale.sol';
import './EthearnalRepToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract Treasury is MultiOwnable {
    using SafeMath for uint256;

    // Total amount of ether came from crowdsale contract
    uint256 public weiRaised = 0;

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

    // Tells if voting process is active
    bool isVotingActive = false;

    event Deposit(uint256 amount);

    // Registry of votes
    mapping(address => bool) votesByAddress;

    // Sum of weights of YES votes
    uint256 yesVoteSum = 0;

    // Sum of weights of NO votes
    uint256 noVoteSum = 0;

    // Date when vote has started
    uint256 votingStarted = 0;

    // Array of people voted in current voting
    address[] voters;

    // Length of `voters`
    uint256 votersLength = 0;

    uint256 initialQuorumPercent = 51;

    // EthearnalRepToken instance
    EthearnalRepToken public tokenContract;

    // "YES" converted to binary
    //bytes[] public constant VOTE_YES = 0x594553;

    // "NO" converted to binary
    //bytes[] public constant VOTE_NO = 0x4e4f;

    function Treasury(address _teamWallet, address _tokenContract) public {
        require(_teamWallet != 0x0);
        require(_tokenContract != 0x0);
        // TODO: check address integrity
        teamWallet = _teamWallet;
        // TODO: check address integrity
        tokenContract = EthearnalRepToken(_tokenContract);
    }

    // TESTED
    function() public payable {
        if (msg.value == 0) {
            if (isDataYes(msg.data)) {
                processVote(true);
            } else if (isDataYes(msg.data)) {
                processVote(false);
            } else {
                revert();
            }
        } else {
            require(msg.sender == address(crowdsaleContract));
            weiRaised = weiRaised.add(msg.value);
            Deposit(msg.value);
        }
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
        // withdrawChunk = getWeiRaised().div(10);
        withdrawChunk = weiRaised.div(10);
        weiUnlocked = withdrawChunk;
        isCrowdsaleFinished = true;
    }

    // TESTED
    function withdrawTeamFunds() public onlyOwner {
        require(isCrowdsaleFinished);
        require(weiUnlocked > weiWithdrawed);
        teamWallet.transfer(weiUnlocked.sub(weiWithdrawed));
        weiWithdrawed = weiUnlocked;
    }

    //function getWeiRaised() public returns(uint256) {
    //    return crowdsaleContract.weiRaised();
    //}

    function startWithdrawVoting() public onlyOwner {
        require(isCrowdsaleFinished);
        require(weiUnlocked == weiWithdrawed);
        require(!isVotingActive);
        // Clear mappings from previous votings
        for(uint256 idx=0; idx<votersLength; idx++) {
            delete votesByAddress[voters[idx]];
        }
        // "Clear" voters array
        votersLength = 0;
        isVotingActive = true;
        votingStarted = getTime();
        yesVoteSum = 0;
        noVoteSum = 0;
    }

    // TESTED
    function isDataYes(bytes data) public returns (bool) {
        // compare data with "YES" string
        return (
            data.length == 3 &&
            data[0] == 0x59 &&
            data[1] == 0x45 &&
            data[2] == 0x53
        );
    }

    // TESTED
    function isDataNo(bytes data) public returns (bool) {
        // compare data with "NO" string
        return (
            data.length == 2 &&
            data[0] == 0x4e &&
            data[1] == 0x4f
        );
    }

    function processVote(bool isYes) internal {
        require(isVotingActive);
        require(!votesByAddress[msg.sender]);
        voters[votersLength] = msg.sender;
        votersLength = votersLength.add(1);
        uint256 voteWeight = tokenContract.balanceOf(msg.sender);
        if (isYes) {
            yesVoteSum = yesVoteSum.add(voteWeight);
        } else {
            noVoteSum = noVoteSum.add(voteWeight);
        }
        uint256 quorumPercent = getQuorumPercent();
        if (quorumPercent == 0) {
            isVotingActive = false;
        } else {
            uint256 quorum = quorumPercent.mul(tokenContract.totalSupply()).div(100);
            if (yesVoteSum.add(noVoteSum) >= quorum) {
                if (yesVoteSum > noVoteSum) {
                    // does not matter if it would be greater than weiRaised
                    weiUnlocked = weiUnlocked.add(withdrawChunk);
                } else {
                    // do nothing, just deactivate voting
                    isVotingActive = false;
                }
            }
        }
    }

    function getQuorumPercent() public returns (uint256) {
        require(isVotingActive);
        // find number of full weeks alapsed since voting started
        uint256 weeksNumber = getTime().sub(votingStarted).div(1 weeks);
        if (initialQuorumPercent < weeksNumber * 10) {
            return 0;
        } else {
            return initialQuorumPercent.sub(weeksNumber * 10);
        }
    }

    function getTime() internal returns (uint256) {
        // Just returns `now` value
        // This function is redefined in EthearnalRepTokenCrowdsaleMock contract
        // to allow testing contract behaviour at different time moments
        return now;
    }
}
