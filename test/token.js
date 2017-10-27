require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestTokenContract} = require('./util/deploy.js');

contract('Token [basic features]', function(accounts) {
    let {tokenContract} = {};

    beforeEach(async () => {
        tokenContract = await deployTestTokenContract();
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

    it('records last movement', async () => {
        await tokenContract.mint(accounts[0], data.TOKEN_RATE_ETHER);
        await tokenContract.setTime(data.SALE_START_DATE);
        await tokenContract.unlock();
        (0).should.be.bignumber.equal(
            await tokenContract.lastMovement(accounts[0])
        )
        await tokenContract.transfer(accounts[1], data.TOKEN_RATE_ETHER);
        data.SALE_START_DATE.should.be.bignumber.equal(
            await tokenContract.lastMovement(accounts[0])
        );
    })
});
