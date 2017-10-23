require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestTreasuryContract} = require('./util/deploy.js');

contract('TreasuryContract [all features]', function(accounts) {
    let {treasuryContract, teamWallet} = {};

    beforeEach(async () => {
        teamWallet = accounts[2];
        treasuryContract = await deployTestTreasuryContract(
            [accounts[0], accounts[1]], teamWallet
        );
    });

    it('isCrowdsaleFinished by default', async () => {
        false.should.be.equal(
            await treasuryContract.isCrowdsaleFinished()
        );
    });

    it('weiRaised represents amount of income ethere', async () => {
        await treasuryContract.sendTransaction({value: data.ETHER});
        await treasuryContract.sendTransaction({value: data.ETHER});
        data.ETHER.mul(2).should.be.bignumber.equal(
            await web3.eth.getBalance(treasuryContract.address)
        );
    });

    it('setCrowdsaleContract', async () => {
        big(0).should.be.bignumber.equal(
            await treasuryContract.crowdsaleContract()
        );
        await treasuryContract.setCrowdsaleContract(accounts[2]);
        accounts[2].should.be.equal(
            await treasuryContract.crowdsaleContract()
        );
    });

    it('setCrowdsaleContract works only once', async () => {
        await treasuryContract.setCrowdsaleContract(accounts[2]);
        await treasuryContract.setCrowdsaleContract(accounts[2])
            .should.be.rejectedWith('invalid opcode');
    });

    it('setCrowdsaleFinished failes if not called from crowdsale', async () => {
        // no crowdsale contract is set yet
        await treasuryContract.setCrowdsaleFinished({from: accounts[2]})
            .should.be.rejectedWith('invalid opcode');
        await treasuryContract.setCrowdsaleContract(accounts[3]);
        await treasuryContract.setCrowdsaleFinished({from: accounts[2]})
            .should.be.rejectedWith('invalid opcode');
        await treasuryContract.setCrowdsaleFinished({from: accounts[3]});
        true.should.be.equal(
            await treasuryContract.isCrowdsaleFinished()
        );
    });

    it('setCrowdsaleFinished', async () => {
        await treasuryContract.setCrowdsaleContract(accounts[3]);
        let weiAmount = data.ETHER.mul(11);
        await treasuryContract.sendTransaction({value: weiAmount});
        await treasuryContract.setCrowdsaleFinished({from: accounts[3]});
        true.should.be.equal(
            await treasuryContract.isCrowdsaleFinished()
        );
        let withdrawChunk = weiAmount.divToInt(10);
        withdrawChunk.should.be.bignumber.equal(
            await treasuryContract.withdrawChunk()
        );
        withdrawChunk.should.be.bignumber.equal(
            await treasuryContract.weiUnlocked()
        );
        big(0).should.be.bignumber.equal(
            await treasuryContract.weiWithdrawed()
        );
    });

    it('withdrawTeamFunds [10% unlocked when crowdsale finisehd]', async () => {
        await treasuryContract.setCrowdsaleContract(accounts[0]);
        let weiAmount = data.ETHER.mul(11);
        await treasuryContract.sendTransaction({value: weiAmount});
        await treasuryContract.setCrowdsaleFinished();
        let withdrawChunk = weiAmount.divToInt(10);
        let beforeBalance = await web3.eth.getBalance(teamWallet);
        await treasuryContract.withdrawTeamFunds();
        beforeBalance.add(withdrawChunk).should.be.bignumber.equal(
            await web3.eth.getBalance(teamWallet)
        );
    });

    it('withdrawTeamFunds fails if nothing to withdraw]', async () => {
        await treasuryContract.setCrowdsaleContract(accounts[0]);
        let weiAmount = data.ETHER.mul(11);
        await treasuryContract.sendTransaction({value: weiAmount});
        await treasuryContract.setCrowdsaleFinished();
        let beforeBalance = await web3.eth.getBalance(teamWallet);
        await treasuryContract.withdrawTeamFunds();
        await treasuryContract.withdrawTeamFunds()
            .should.be.rejectedWith('invalid opcode');
    });

    it('withdrawTeamFunds changes weiWithdrawed]', async () => {
        await treasuryContract.setCrowdsaleContract(accounts[0]);
        let weiAmount = data.ETHER.mul(11);
        await treasuryContract.sendTransaction({value: weiAmount});
        await treasuryContract.setCrowdsaleFinished();
        big(0).should.be.bignumber.equal(
            await treasuryContract.weiWithdrawed()
        );
        await treasuryContract.withdrawTeamFunds();
        let withdrawChunk = weiAmount.divToInt(10);
        withdrawChunk.should.be.bignumber.equal(
            await treasuryContract.weiWithdrawed()
        );
    });

});

