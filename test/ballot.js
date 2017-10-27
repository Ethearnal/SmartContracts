require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;
let Ballot = artifacts.require('Ballot');
let { deployTestContracts } = require('./util/deploy.js');

contract('Ballot [Basic Features]', function (accounts) {
    let { votingProxyContract } = {};

    beforeEach(async () => {
        ({ votingProxyContract, saleContract, treasuryContract, tokenContract } = await deployTestContracts(accounts));
    });

    it('startincreaseWithdrawalTeam creates new ballot', async () => {
        '0x0000000000000000000000000000000000000000'.should.equal(
            await votingProxyContract.currentIncreaseWithdrawalTeamBallot()
        )
        await votingProxyContract.startincreaseWithdrawalTeam()
            .should.be.rejectedWith('invalid opcode');
        await saleContract.setTime(data.SALE_END_DATE - 1);
        await saleContract.setSaleCapUsd(1000);
        let weiAmount = data.convertUsdToEther(2000);
        await saleContract.sendTransaction({ value: weiAmount });
        await saleContract.finalizeByAdmin();
        await votingProxyContract.startincreaseWithdrawalTeam()
        let ballot = await votingProxyContract.currentIncreaseWithdrawalTeamBallot()
        ballot.should.not.equal('0x0000000000000000000000000000000000000000');
        let ballotContract = await Ballot.at(ballot);
        tokenContract.address.should.equal(
            await ballotContract.tokenContract()
        )
        votingProxyContract.address.should.equal(
            await ballotContract.proxyVotingContract()
        )
    })

    describe('functionality', async () => {
        let ballotContract;
        beforeEach(async () => {
            await saleContract.setTime(data.SALE_END_DATE - 1);
            await saleContract.setSaleCapUsd(1000);
            let weiAmount = data.convertUsdToEther(2000);
            await saleContract.sendTransaction({ value: weiAmount });
            await saleContract.finalizeByAdmin();
            await votingProxyContract.startincreaseWithdrawalTeam()
            let ballot = await votingProxyContract.currentIncreaseWithdrawalTeamBallot()
            ballotContract = await Ballot.at(ballot);
        })
        it('starts the ballot', async () => {
            await ballotContract.startBallot();
            true.should.equal(
                await ballotContract.isVotingActive()
            )
        })

        it('accepts yes vote', async () => {
            let beforeweiUnlocked = await treasuryContract.weiUnlocked();
            let withdrawChunk = await treasuryContract.withdrawChunk();
            await ballotContract.startBallot();
            await ballotContract.vote("yes");
            let votersLength = await ballotContract.votersLength();
            (1).should.be.equal(
                votersLength.toNumber()
            );
            let balance = await tokenContract.balanceOf(accounts[0]);
            let yesVoteSum = await ballotContract.yesVoteSum();
            balance.should.be.bignumber.equal(yesVoteSum);
            false.should.equal(
                await ballotContract.isVotingActive()
            )
            let afterweiUnlocked = await treasuryContract.weiUnlocked();
            afterweiUnlocked.should.be.bignumber.equal(
                beforeweiUnlocked.add(withdrawChunk)
            )

        })

        it('accepts no vote', async () => {
            let beforeweiUnlocked = await treasuryContract.weiUnlocked();
            let withdrawChunk = await treasuryContract.withdrawChunk();
            await ballotContract.startBallot();
            await ballotContract.vote("NO");
            let votersLength = await ballotContract.votersLength();
            (1).should.be.equal(
                votersLength.toNumber()
            );
            let balance = await tokenContract.balanceOf(accounts[0]);
            let noVoteSum = await ballotContract.noVoteSum();
            balance.should.be.bignumber.equal(noVoteSum);
            false.should.equal(
                await ballotContract.isVotingActive()
            )
            let afterweiUnlocked = await treasuryContract.weiUnlocked();
            afterweiUnlocked.should.be.bignumber.equal(
                beforeweiUnlocked
            )

        })

        it('isDataYes', async () => {
            true.should.be.equal(await ballotContract.isDataYes.call("YES"));
            false.should.be.equal(await ballotContract.isDataYes.call(" YES"));
            false.should.be.equal(await ballotContract.isDataYes.call("YESS"));
            false.should.be.equal(await ballotContract.isDataYes.call("YES "));
            true.should.be.equal(await ballotContract.isDataYes.call("yes"));
        });

        it('isDataNo', async () => {
            true.should.be.equal(await ballotContract.isDataNo.call("NO"));
            false.should.be.equal(await ballotContract.isDataNo.call(" NO"));
            false.should.be.equal(await ballotContract.isDataNo.call("NOO"));
            false.should.be.equal(await ballotContract.isDataNo.call("NO "));
            true.should.be.equal(await ballotContract.isDataNo.call("no"));
        });


    })

    describe('voting', async () => {
        let ballotContract;
        beforeEach(async () => {
            await saleContract.setTime(data.SALE_START_DATE + 1);
            let weiAmount = data.convertUsdToEther(1000);
            await saleContract.sendTransaction({ value: weiAmount });
            await saleContract.sendTransaction({ value: weiAmount, from: accounts[1] });
            await saleContract.sendTransaction({ value: weiAmount, from: accounts[2] });
            await saleContract.sendTransaction({ value: weiAmount, from: accounts[3] });
            await saleContract.setTime(data.SALE_END_DATE + 1);
            await saleContract.finalizeByAdmin();
            await votingProxyContract.startincreaseWithdrawalTeam()
            let ballot = await votingProxyContract.currentIncreaseWithdrawalTeamBallot()
            ballotContract = await Ballot.at(ballot);
        })

        it('majority votes no', async () => {
            let beforeweiUnlocked = await treasuryContract.weiUnlocked();
            let withdrawChunk = await treasuryContract.withdrawChunk();
            await ballotContract.startBallot();
            await ballotContract.vote("NO");
            let votersLength = await ballotContract.votersLength();
            (1).should.be.equal(
                votersLength.toNumber()
            );
            let balance = await tokenContract.balanceOf(accounts[0]);
            let noVoteSum = await ballotContract.noVoteSum();
            balance.should.be.bignumber.equal(noVoteSum);
            true.should.equal(
                await ballotContract.isVotingActive()
            )
            await ballotContract.vote("NO", {from: accounts[1]});
            noVoteSum = await ballotContract.noVoteSum();
            balance.mul(2).should.be.bignumber.equal(noVoteSum);
            await ballotContract.vote("NO", {from: accounts[2]});
            false.should.equal(
                await ballotContract.isVotingActive()
            )
            let afterweiUnlocked = await treasuryContract.weiUnlocked();
            afterweiUnlocked.should.be.bignumber.equal(
                beforeweiUnlocked
            )
        })

        it('majority yes', async () => {
            let beforeweiUnlocked = await treasuryContract.weiUnlocked();
            let withdrawChunk = await treasuryContract.withdrawChunk();
            await ballotContract.startBallot();
            await ballotContract.vote("yes");
            let votersLength = await ballotContract.votersLength();
            (1).should.be.equal(
                votersLength.toNumber()
            );
            let balance = await tokenContract.balanceOf(accounts[0]);
            let yesVoteSum = await ballotContract.yesVoteSum();
            balance.should.be.bignumber.equal(yesVoteSum);
            true.should.equal(
                await ballotContract.isVotingActive()
            )
            await ballotContract.vote("Yes", {from: accounts[1]});
            yesVoteSum = await ballotContract.yesVoteSum();
            balance.mul(2).should.be.bignumber.equal(yesVoteSum);
            await ballotContract.vote("YES", {from: accounts[2]});
            false.should.equal(
                await ballotContract.isVotingActive()
            )
            let afterweiUnlocked = await treasuryContract.weiUnlocked();
            afterweiUnlocked.should.be.bignumber.equal(
                beforeweiUnlocked.add(withdrawChunk)
            )
            votersLength = await ballotContract.votersLength();
            (3).should.be.equal(
                votersLength.toNumber()
            );
        })

    })
})