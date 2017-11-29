require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;
let Ballot = artifacts.require('Ballot');
let { deployTestContracts } = require('./util/deploy.js');

contract('Treasury [Refund Features]', function (accounts) {
    let { votingProxyContract, saleContract, treasuryContract, tokenContract, ballotContract } = {};

    beforeEach(async () => {
        ({ votingProxyContract, saleContract, treasuryContract, tokenContract } = await deployTestContracts(accounts));
    });

    it('happy flow to get refund', async () => {
        
        await treasuryContract.enableRefunds()
            .should.be.rejectedWith('invalid opcode');
        false.should.be.equal(
            await treasuryContract.isRefundsEnabled()
        )
        await saleContract.setTime(data.SALE_END_DATE - 1);
        await saleContract.setSaleCapUsd(1000);
        let weiAmount = data.convertUsdToEther(2000);
        await saleContract.sendTransaction({ value: weiAmount });
        let treasureBalance = await web3.eth.getBalance(treasuryContract.address);
        let tokenBalance = await tokenContract.balanceOf(accounts[0]);
        await saleContract.finalizeByAdmin();
        await votingProxyContract.startRefundInvestorsBallot();
        let ballot = await votingProxyContract.currentRefundInvestorsBallot()
        ballot.should.not.equal('0x0000000000000000000000000000000000000000');
        ballotContract = await Ballot.at(ballot);
        
        const {logs} = await ballotContract.vote("yes");
        false.should.be.equal(
            await ballotContract.isVotingActive()
        )

        const event = logs.find(e => e.event === 'FinishBallot');
        event.should.exist;
        true.should.be.equal(
            await treasuryContract.isRefundsEnabled()
        )

        await treasuryContract.refundInvestor(tokenBalance.toString(10))
            .should.be.rejectedWith('invalid opcode');
        
        await tokenContract.approve(treasuryContract.address, tokenBalance.toString(10));
        let totalSupply = await tokenContract.totalSupply();
        let balanceBefore = await web3.eth.getBalance(accounts[0]);
        const refundTx = await treasuryContract.refundInvestor(tokenBalance.toString(10))
        refundTx.logs[0].event.should.be.equal('RefundedInvestor');

        const newTotalSupply = totalSupply.sub(tokenBalance);
        let b = balanceBefore.add(weiAmount)
        newTotalSupply.should.be.bignumber.equal(
            await tokenContract.totalSupply()
        );

        (0).should.be.bignumber.equal(
            await tokenContract.balanceOf(accounts[0])
        )

    })

    it('happy flow to get refund', async () => {
        
        await treasuryContract.enableRefunds()
            .should.be.rejectedWith('invalid opcode');
        false.should.be.equal(
            await treasuryContract.isRefundsEnabled()
        )
        await saleContract.setTime(data.SALE_END_DATE - 1);
        await saleContract.setSaleCapUsd(1000);
        let weiAmount = data.convertUsdToEther(2000);
        await saleContract.sendTransaction({ value: weiAmount });
        let treasureBalance = await web3.eth.getBalance(treasuryContract.address);
        let tokenBalance = await tokenContract.balanceOf(accounts[0]);
        await saleContract.finalizeByAdmin();
        await votingProxyContract.startRefundInvestorsBallot();
        let ballot = await votingProxyContract.currentRefundInvestorsBallot()
        ballot.should.not.equal('0x0000000000000000000000000000000000000000');
        ballotContract = await Ballot.at(ballot);
        
        const {logs} = await ballotContract.vote("yes");
        false.should.be.equal(
            await ballotContract.isVotingActive()
        )

        const event = logs.find(e => e.event === 'FinishBallot');
        event.should.exist;
        true.should.be.equal(
            await treasuryContract.isRefundsEnabled()
        )

        await treasuryContract.refundInvestor(tokenBalance.toString(10))
            .should.be.rejectedWith('invalid opcode');
        
        await tokenContract.approve(treasuryContract.address, tokenBalance.toString(10));
        let totalSupply = await tokenContract.totalSupply();
        let balanceBefore = await web3.eth.getBalance(accounts[0]);
        await treasuryContract.withdrawTeamFunds();
        const refundTx = await treasuryContract.refundInvestor(tokenBalance.toString(10))
        refundTx.logs[0].event.should.be.equal('RefundedInvestor');

        const newTotalSupply = totalSupply.sub(tokenBalance);
        let b = balanceBefore.add(weiAmount)
        newTotalSupply.should.be.bignumber.equal(
            await tokenContract.totalSupply()
        );

        (0).should.be.bignumber.equal(
            await tokenContract.balanceOf(accounts[0])
        )

    })
});