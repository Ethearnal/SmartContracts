require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

contract('Ethearnal Rep Token Crowdsale [Basic Features]', function(accounts) {
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
        data.TOKEN_RATE_USD.mul(data.ETHER).divToInt(data.ETHER_RATE_USD).divToInt(1000).should.be.bignumber.equal(
            await saleContract.getTokenRateEther.call()
        );
    });

});
