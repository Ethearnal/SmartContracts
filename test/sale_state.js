require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

contract('Ethearnal Rep Token Crowdsale [State Features]', function(accounts) {
    let {tokenContract, saleContract} = {};

    beforeEach(async () => {
        ({tokenContract, saleContract} = await deployTestContracts(accounts));
    });

    it('getCurrentState & getStateForTime [before main sale]', async () => {
        await saleContract.setTime(data.SALE_START_DATE - 1);
        data.SALE_STATE.BeforeMainSale.should.be.bignumber.equal(
            await saleContract.getCurrentStateProxy.call()
        );
        data.SALE_STATE.BeforeMainSale.should.be.bignumber.equal(
            await saleContract.getStateForTimeProxy.call(data.SALE_START_DATE - 1)
        );
    });

    it('getCurrentState & getStateForTime [main sale]', async () => {
        await saleContract.setTime(data.SALE_START_DATE);
        data.SALE_STATE.MainSale.should.be.bignumber.equal(
            await saleContract.getCurrentStateProxy.call()
        );
        data.SALE_STATE.MainSale.should.be.bignumber.equal(
            await saleContract.getStateForTimeProxy.call(data.SALE_START_DATE)
        );
    });

    it('getCurrentState & getStateForTime [main sale done]', async () => {
        await saleContract.setTime(data.SALE_END_DATE);
        data.SALE_STATE.MainSaleDone.should.be.bignumber.equal(
            await saleContract.getCurrentStateProxy.call()
        );
        data.SALE_STATE.MainSaleDone.should.be.bignumber.equal(
            await saleContract.getStateForTimeProxy.call(data.SALE_END_DATE)
        );
    });

    it('getCurrentState & getStateForTime [finilized]', async () => {
        await saleContract.setTime(data.SALE_END_DATE);
        await saleContract.finalizeByAdmin.call();
        data.SALE_STATE.MainSaleDone.should.be.bignumber.equal(
            await saleContract.getCurrentStateProxy.call()
        );
        data.SALE_STATE.MainSaleDone.should.be.bignumber.equal(
            await saleContract.getStateForTimeProxy.call(data.SALE_END_DATE)
        );
    });

});
