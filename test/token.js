require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

contract('Ethearnal Rep Token [basic properties]', function(accounts) {
    let {tokenContract} = {};

    beforeEach(async () => {
        ({tokenContract} = await deployTestContracts(accounts));
    });

    it('Name of token', async () => {
        assert.equal(data.TOKEN_NAME, await tokenContract.name());
    });

    it('Symbol of token', async () => {
        assert.equal(data.TOKEN_SYMBOL, await tokenContract.symbol());
    });

    it('Decimals attribute', async () => {
        data.DECIMALS.should.be.bignumber.equal(
            await tokenContract.decimals()
        );
    });

    it('initial totalSupply', async () => {
        big(0).should.be.bignumber.equal(
            await tokenContract.totalSupply()
        );
    });
});
