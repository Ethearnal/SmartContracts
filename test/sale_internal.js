require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

contract('Ethearnal Rep Token Crowdsale [Internal Features]', function(accounts) {
    let {tokenContract, saleContract} = {};

    beforeEach(async () => {
        ({tokenContract, saleContract} = await deployTestContracts(accounts));
    });

    it('converUsdToEther', async () => {
        big(4).mul(data.ETHER).divToInt(data.ETHER_RATE_USD).should.be.bignumber.equal(
            await saleContract.convertUsdToEther.call(4)
        );
    });

    it('getTokenRateEther', async () => {
        data.getTokenRateEther().should.be.bignumber.equal(
            await saleContract.getTokenRateEther.call()
        );
    });

    it('getTokenAmountForEther', async () => {
        data.ETHER.mul(5).divToInt(data.getTokenRateEther()).mul(10**data.DECIMALS).should.be.bignumber.equal(
            await saleContract.getTokenAmountForEther.call(data.ETHER.mul(5))
        );
    });

    it('min function', async () => {
        big(1).should.be.bignumber.equal(await saleContract.min.call(1, 3));
        big(3).should.be.bignumber.equal(await saleContract.min.call(5, 3));
        big(4).should.be.bignumber.equal(await saleContract.min.call(4, 4));
    });

    it('max function', async () => {
        big(3).should.be.bignumber.equal(await saleContract.max.call(1, 3));
        big(5).should.be.bignumber.equal(await saleContract.max.call(5, 3));
        big(4).should.be.bignumber.equal(await saleContract.max.call(4, 4));
    });

    it('ceil function', async () => {
        big(7200).should.be.bignumber.equal(await saleContract.ceil.call(3609, 3600));
        big(3600).should.be.bignumber.equal(await saleContract.ceil.call(3600, 3600));
        big(3600).should.be.bignumber.equal(await saleContract.ceil.call(3509, 3600));
        big(200).should.be.bignumber.equal(await saleContract.ceil.call(109, 100));
        big(110).should.be.bignumber.equal(await saleContract.ceil.call(109, 10));
    });

});
