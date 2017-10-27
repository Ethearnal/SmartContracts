pragma solidity ^0.4.15;

import "./EthearnalRepToken.sol";
import "./Treasury.sol";

contract Ballot {
    using SafeMath for uint256;
    EthearnalRepToken public tokenContract;

    uint256 public ballotStarted;

    // Registry of votes
    mapping(address => bool) public votesByAddress;

    // Sum of weights of YES votes
    uint256 public yesVoteSum = 0;

    // Sum of weights of NO votes
    uint256 public noVoteSum = 0;

    // Date when vote has started
    uint256 public votingStarted = 0;

    // Length of `voters`
    uint256 public votersLength = 0;

    uint256 public initialQuorumPercent = 51;

    Treasury public treasuryContract;


    // Tells if voting process is active
    bool public isVotingActive = false;
    
    modifier onlyWhenBallotStarted {
        require(ballotStarted != 0);
        _;
    }
    
    function Ballot(address _tokenContract, address _treasuryContract) {
        tokenContract = EthearnalRepToken(_tokenContract);
        treasuryContract = Treasury(_treasuryContract);
    }
    
    function startBallot() public {
        ballotStarted = now;
        isVotingActive = true;
    }

    function vote(bytes _vote) public onlyWhenBallotStarted {
        require(_vote.length > 0);
        if (isDataYes(_vote)) {
            processVote(true);
        } else if (isDataNo(msg.data)) {
            processVote(false);
        }
    }

    function isDataYes(bytes data) public constant returns (bool) {
        // compare data with "YES" string
        return (
            data.length == 3 &&
            (data[0] == 0x59 || data[0] == 0x79) &&
            (data[1] == 0x45 || data[1] == 0x65) &&
            (data[2] == 0x53 || data[2] == 0x73)
        );
    }

    // TESTED
    function isDataNo(bytes data) public constant returns (bool) {
        // compare data with "NO" string
        return (
            data.length == 2 &&
            (data[0] == 0x4e || data[0] == 0x6e) &&
            (data[1] == 0x4f || data[1] == 0x6f)
        );
    }
    
    function processVote(bool isYes) internal {
        require(isVotingActive);
        require(!votesByAddress[msg.sender]);
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
            uint256 soFarVoted = yesVoteSum.add(noVoteSum);
            if (soFarVoted >= quorum) {
                uint256 percentYes = (100 * yesVoteSum).div(soFarVoted);
                if (percentYes >= quorum) {
                    // does not matter if it would be greater than weiRaised
                    treasuryContract.increaseWithdrawalChunk();
                } else {
                    // do nothing, just deactivate voting
                    isVotingActive = false;
                }
            }
        }
    }

    function getQuorumPercent() public constant returns (uint256) {
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