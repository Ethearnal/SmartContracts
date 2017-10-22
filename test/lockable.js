require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestTokenContract} = require('./util/deploy.js');

contract('Ethearnal Rep Token [Lockable feature]', function(accounts) {
    let {tokenContract} = {};

    beforeEach(async () => {
        tokenContract = await deployTestTokenContract();
    });

    it('Tokens are locked by default', async () => {
        assert.equal(true, await tokenContract.isLocked());
        await tokenContract.mint(accounts[0], 100);
        await tokenContract.approve(accounts[1], 100)
            .should.be.rejectedWith('invalid opcode');
        await tokenContract.transfer(accounts[1], 100)
            .should.be.rejectedWith('invalid opcode');
        await tokenContract.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]})
            .should.be.rejectedWith('invalid opcode');
    });

    it('Tokens could be unlocked', async () => {
        await tokenContract.mint(accounts[0], 100);
        await tokenContract.unlock();
        await tokenContract.approve(accounts[1], 100);
        await tokenContract.transfer(accounts[1], 20);
        await tokenContract.transferFrom(accounts[0], accounts[2], 20, {from: accounts[1]});
        assert.equal(60, await tokenContract.balanceOf(accounts[0]));
        assert.equal(20, await tokenContract.balanceOf(accounts[1]));
        assert.equal(20, await tokenContract.balanceOf(accounts[2]));
    });

    it('Token could be unlocked only by owner', async () => {
        await tokenContract.unlock({from: accounts[1]})
            .should.be.rejectedWith('invalid opcode');
    });
})
