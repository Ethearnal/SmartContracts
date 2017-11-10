require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;
let { etherUsedForTx } = require('./util/gas.js');

let { deployTestContracts } = require('./util/deploy.js');

contract('Crowdsale [Whitelist]', function (accounts) {
    let {tokenContract, saleContract, treasuryContract} = {};

    beforeEach(async () => {
        ({tokenContract, saleContract, treasuryContract} = await deployTestContracts(accounts));
    });

    describe('whitelisted features', async () => {

        describe('#whitelistInvestor', async () => {
            it('cannot by called by non-owner', async () => {
                await saleContract.whitelistInvestor(accounts[0], { from: accounts[2] })
                    .should.be.rejectedWith(data.REVERT_MSG);
            })
            it('whitelists an investor', async () => {
                '0'.should.be.bignumber.equal(
                    await saleContract.whitelistedInvestorCounter()
                )
                false.should.be.equal(
                    await saleContract.whitelist(accounts[0])
                )
                await saleContract.whitelistInvestor(accounts[0]);
                true.should.be.equal(
                    await saleContract.whitelist(accounts[0])
                )
                '1'.should.be.bignumber.equal(
                    await saleContract.whitelistedInvestorCounter()
                )
            })
        })
        describe('#whitelistInvestors', async () => {
            it('cannot by called by non-owner', async () => {
                await saleContract.whitelistInvestors([accounts[0]], { from: accounts[2] })
                    .should.be.rejectedWith(data.REVERT_MSG);
            })
            it('whitelists investors', async () => {
                '0'.should.be.bignumber.equal(
                    await saleContract.whitelistedInvestorCounter()
                )
                false.should.be.equal(
                    await saleContract.whitelist(accounts[0])
                )
                await saleContract.whitelistInvestors([accounts[0], accounts[1], accounts[2]]);
                true.should.be.equal(
                    await saleContract.whitelist(accounts[2])
                )
                '3'.should.be.bignumber.equal(
                    await saleContract.whitelistedInvestorCounter()
                )
            })
        })
        describe('#blacklistInvestor', async () => {
            it('cannot by called by non-owner', async () => {
                await saleContract.blacklistInvestor(accounts[0], { from: accounts[2] })
                    .should.be.rejectedWith(data.REVERT_MSG);
            })
            it('blacklist an investors', async () => {
                '0'.should.be.bignumber.equal(
                    await saleContract.whitelistedInvestorCounter()
                )
                false.should.be.equal(
                    await saleContract.whitelist(accounts[0])
                )
                await saleContract.whitelistInvestors([accounts[0], accounts[1], accounts[2]]);
                true.should.be.equal(
                    await saleContract.whitelist(accounts[0])
                )
                '3'.should.be.bignumber.equal(
                    await saleContract.whitelistedInvestorCounter()
                )
                await saleContract.blacklistInvestor(accounts[0]);
                false.should.be.equal(
                    await saleContract.whitelist(accounts[0])
                )
                '2'.should.be.bignumber.equal(
                    await saleContract.whitelistedInvestorCounter()
                )
            })
        })

        describe('#whitelisted purchase', async()=> {
            it('allows to buy any amount of tokens', async () => {
                await saleContract.setTime(data.SALE_START_DATE);
                await saleContract.whitelistInvestors([accounts[0]]);
                let weiAmount = data.convertUsdToEther(data.HOUR_LIMIT_BY_ADDRESS_USD.mul(30000));
                let tokenAmount = weiAmount.divToInt(data.TOKEN_RATE_ETHER).mul(10**data.DECIMALS)
                let initBalance = await web3.eth.getBalance(accounts[0]);
                let initIncomeWalletBalance = await web3.eth.getBalance(treasuryContract.address);
                let res = await saleContract.sendTransaction({value: weiAmount});
                let etherUsed = etherUsedForTx(res);
                weiAmount.should.be.bignumber.equal(
                    await saleContract.weiRaised({from: accounts[1]})
                );
                tokenAmount.should.be.bignumber.equal(
                    await tokenContract.balanceOf(accounts[0])
                );
                initBalance.sub(weiAmount).sub(etherUsed).should.be.bignumber.equal(
                    await web3.eth.getBalance(accounts[0])
                );
                weiAmount.add(initIncomeWalletBalance).should.be.bignumber.equal(
                    await web3.eth.getBalance(treasuryContract.address)
                );
            });
        })
    })
});