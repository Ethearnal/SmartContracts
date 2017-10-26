import './Treasury.sol';
import './Ballot.sol';

contract VotingProxy {
    Treasury public treasuryContract;
    address public currentIncreaseWithdrawalTeamBallot;

    function  VotingProxy(address, _treasuryContract) {
        treasuryContract = _treasuryContract;
    }

    function startincreaseWithdrawalTeam() onlyOwner {
        if(currentIncreaseWithdrawalTeamBallot == 0x0) {
            currentIncreaseWithdrawalTeamBallot =  new Ballot();
        } else {
            require(currentIncreaseWithdrawalTeamBallot.isVotingActive() == false);
            currentIncreaseWithdrawalTeamBallot =  new Ballot();
        }
    }

    function proxyincreaseWithdrawalChunk() {
        treasuryContract.increaseWithdrawalChunk();
    }

    function() {
        revert();
    }
}