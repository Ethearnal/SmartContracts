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

    it('Sale before start fails', async () => {
        await saleContract.setTime(data.SALE_START_DATE - 1);
        await saleContract.sendTransaction({amount: data.ETHER})
            .should.be.rejectedWith('invalid opcode');
    });

    it('Sale after end fails', async () => {
        await saleContract.setTime(data.SALE_END_DATE);
        await saleContract.sendTransaction({amount: data.ETHER})
            .should.be.rejectedWith('invalid opcode');
    });

//    it('Check money flow', async () => {
//        await saleContract.setTime(data.SALE_START_DATE);
//        let weiAmount = data.ETHER;
//        let tokenAmount = data.ETHER.divToInt(data.TOKEN_RATE).mul(10**data.DECIMALS)
//        let initIncomeWalletBalance = await web3.eth.getBalance(incomeWallet);
//        await saleContract.sendTransaction({value: weiAmount});
//        data.TOTAL_SUPPLY.sub(tokenAmount).should.be.bignumber.equal(
//            await tokenContract.balanceOf(saleWallet)
//        );
//        tokenAmount.should.be.bignumber.equal(
//            await tokenContract.balanceOf(accounts[0])
//        );
//        weiAmount.add(initIncomeWalletBalance).should.be.bignumber.equal(
//            await web3.eth.getBalance(incomeWallet)
//        );
//        weiAmount.should.be.bignumber.equal(
//            await saleContract.weiRaised()
//        );
//    });
//
//    it('Check buyTokens', async () => {
//        await saleContract.setTime(data.SALE_START_DATE);
//        let weiAmount = data.ETHER;
//        let tokenAmount = data.ETHER.divToInt(data.TOKEN_RATE).mul(10**data.DECIMALS)
//        await saleContract.buyTokens(accounts[0], {value: weiAmount});
//        tokenAmount.should.be.bignumber.equal(
//            await tokenContract.balanceOf(accounts[0])
//        );
//    });
//
//    it('Check sale cap', async () => {
//        await saleContract.setTime(data.SALE_START_DATE);
//        let weiAmount = data.SALE_CAP;
//        await saleContract.sendTransaction({value: weiAmount});
//        weiAmount.should.be.bignumber.equal(
//            await saleContract.weiRaised()
//        );
//        // Any extra wei should be rejected
//        await saleContract.sendTransaction({value: data.ETHER})
//            .should.be.rejectedWith('invalid opcode');
//    });
//
//    it('Explicitly check that 1 ether is equal to 15000 tokens with 18 decimals', async () => {
//        await saleContract.setTime(data.SALE_START_DATE);
//        let weiAmount = data.ETHER;
//        await saleContract.buyTokens(accounts[0], {value: weiAmount});
//        big(15000).mul(10**18).should.be.bignumber.equal(
//            await tokenContract.balanceOf(accounts[0])
//        );
//    });
});
