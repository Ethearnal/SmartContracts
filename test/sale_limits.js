require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

contract('Ethearnal Rep Token Crowdsale [Finalization]', function(accounts) {
    let {tokenContract, saleContract} = {};

    beforeEach(async () => {
        ({tokenContract, saleContract} = await deployTestContracts(accounts));
    });

    it('getWeiAllowedFromAddress at 00:00', async () => {
        await saleContract.setTime(data.SALE_START_DATE);
        data.HOUR_LIMIT_BY_ADDRESS_WEI.should.be.bignumber.equal(
            await saleContract.getWeiAllowedFromAddressProxy.call(accounts[0])
        );
    });

    it('getWeiAllowedFromAddress at 01:00', async () => {
        await saleContract.setTime(data.SALE_START_DATE + 3600);
        data.HOUR_LIMIT_BY_ADDRESS_WEI.should.be.bignumber.equal(
            await saleContract.getWeiAllowedFromAddressProxy.call(accounts[0])
        );
    });

    it('getWeiAllowedFromAddress at 01:01', async () => {
        await saleContract.setTime(data.SALE_START_DATE + 3600 * 1 + 1);
        data.HOUR_LIMIT_BY_ADDRESS_WEI.mul(2).should.be.bignumber.equal(
            await saleContract.getWeiAllowedFromAddressProxy.call(accounts[0])
        );
    });

    it('getWeiAllowedFromAddress at 02:01', async () => {
        await saleContract.setTime(data.SALE_START_DATE + 3600 * 2 + 1);
        data.HOUR_LIMIT_BY_ADDRESS_WEI.mul(3).should.be.bignumber.equal(
            await saleContract.getWeiAllowedFromAddressProxy.call(accounts[0])
        );
    });

    it('getWeiAllowedFromAddress at 719:01', async () => {
        await saleContract.setTime(data.SALE_START_DATE + 3600 * 719 + 1);
        data.HOUR_LIMIT_BY_ADDRESS_WEI.mul(720).should.be.bignumber.equal(
            await saleContract.getWeiAllowedFromAddressProxy.call(accounts[0])
        );
    });

    it('getWeiAllowedFromAddress depends on raisedByAddress', async () => {
        await saleContract.setTime(data.SALE_START_DATE);
        let weiAmount = data.ETHER;
        await saleContract.sendTransaction({value: weiAmount});
        data.HOUR_LIMIT_BY_ADDRESS_WEI.sub(weiAmount).should.be.bignumber.equal(
            await saleContract.getWeiAllowedFromAddressProxy.call(accounts[0])
        );
    });

});
