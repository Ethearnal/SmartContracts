require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;
let {etherUsedForTx} = require('./util/gas.js');

let {deployTestContracts} = require('./util/deploy.js');

contract('Crowdsale [Finalization]', function(accounts) {
    let {tokenContract, saleContract} = {};

    beforeEach(async () => {
        ({tokenContract, saleContract} = await deployTestContracts(accounts));
    });

    it('if sent ether is more than hard cap then change returns', async () => {
        await saleContract.setTime(data.SALE_END_DATE - 1);
        await saleContract.setSaleCapUsd(1000);
        let saleCap = data.convertUsdToEther(1000);
        let weiAmount = data.convertUsdToEther(2000);
        let initBalance = web3.eth.getBalance(accounts[0]);
        let res = await saleContract.sendTransaction({value: weiAmount});
        let etherUsed = etherUsedForTx(res);
        saleCap.should.be.bignumber.equal(
            await saleContract.weiRaised({from: accounts[1]})
        );
        initBalance.sub(saleCap).sub(etherUsed).should.be.bignumber.equal(
            await web3.eth.getBalance(accounts[0])
        );
    });

    it('if sent ether is more than hour cap then change returns', async () => {
        await saleContract.setTime(data.SALE_START_DATE);
        let weiAmount = data.convertUsdToEther(data.HOUR_LIMIT_BY_ADDRESS_USD.mul(3));
        let hourLimit = data.HOUR_LIMIT_BY_ADDRESS_WEI;
        let initBalance = web3.eth.getBalance(accounts[0]);
        let res = await saleContract.sendTransaction({value: weiAmount});
        let etherUsed = etherUsedForTx(res);
        hourLimit.should.be.bignumber.equal(
            await saleContract.weiRaised({from: accounts[1]})
        );
        initBalance.sub(hourLimit).sub(etherUsed).should.be.bignumber.equal(
            await web3.eth.getBalance(accounts[0])
        );
    });

});
