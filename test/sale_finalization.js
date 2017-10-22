require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

function getTokenRateEther() {
    return data.TOKEN_RATE_USD.mul(data.ETHER).divToInt(data.ETHER_RATE_USD).divToInt(1000);
}

contract('Ethearnal Rep Token Crowdsale [Finalization]', function(accounts) {
    let {tokenContract, saleContract, teamTokenWallet} = {};

    beforeEach(async () => {
        ({tokenContract, saleContract, teamTokenWallet} = await deployTestContracts(accounts));
    });

    it('isReadyToFinalize is false [before end of main sale]', async () => {
        await saleContract.setTime(data.SALE_START_DATE);
        false.should.be.equal(
            await saleContract.isReadyToFinalize.call()
        );
    });

    it('isReadyToFinalize is true [main sale ended]', async () => {
        await saleContract.setTime(data.SALE_END_DATE);
        true.should.be.equal(
            await saleContract.isReadyToFinalize.call()
        );
    });

    it('isReadyToFinalize is true [sale cap reached]', async () => {
        await saleContract.setTime(data.SALE_START_DATE);
        await saleContract.setSaleCapUsd(1000);
        let weiAmount = data.convertUsdToEther(2000);
        await saleContract.sendTransaction({value: weiAmount});
        true.should.be.equal(
            await saleContract.isReadyToFinalize.call()
        );
    });

    it('finalization unlocks tocken', async () => {
        true.should.be.equal(
            await tokenContract.isLocked()
        );
        await saleContract.setTime(data.SALE_END_DATE - 1);
        await saleContract.sendTransaction({value: data.ETHER})
        await saleContract.setTime(data.SALE_END_DATE);
        await saleContract.finalizeByAdmin();
        false.should.be.equal(
            await tokenContract.isLocked()
        );
    });

    it('finalization sets isFinalized flag', async () => {
        false.should.be.equal(
            await saleContract.isFinalized()
        );
        await saleContract.setTime(data.SALE_END_DATE - 1);
        await saleContract.sendTransaction({value: data.ETHER})
        await saleContract.setTime(data.SALE_END_DATE);
        await saleContract.finalizeByAdmin();
        true.should.be.equal(
            await saleContract.isFinalized()
        );
    });

    it('finalization mints team tokens', async () => {
        await saleContract.setTime(data.SALE_END_DATE - 1);
        let weiAmount = big(9).mul(data.getTokenRateEther())
        await saleContract.sendTransaction({value: weiAmount});
        await saleContract.setTime(data.SALE_END_DATE);
        await saleContract.finalizeByAdmin();
        big(9).mul(10**data.DECIMALS).should.be.bignumber.equal(
            await tokenContract.balanceOf(accounts[0])
        );
        let teamTokens = big(9).mul(10**data.DECIMALS).mul(data.TEAM_TOKEN_RATIO).divToInt(1000)
        teamTokens.should.be.bignumber.equal(
            await tokenContract.balanceOf(teamTokenWallet)
        );
    });

});
