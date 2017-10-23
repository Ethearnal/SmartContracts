require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

contract('Crowdsale [Finalization]', function(accounts) {
    let {tokenContract, saleContract, teamTokenWallet} = {};

    beforeEach(async () => {
        ({tokenContract, saleContract, teamTokenWallet} = await deployTestContracts(accounts));
    });

    it('Team tokens is 1/4 of total tokens', async () => {
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
