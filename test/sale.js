require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

contract('Crowdsale [Basic Features]', function(accounts) {
    let {tokenContract, saleContract, treasuryContract} = {};

    beforeEach(async () => {
        ({tokenContract, saleContract, treasuryContract} = await deployTestContracts(accounts));
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

   it('Check money flow', async () => {
       const incomeWallet = web3.eth.accounts[1];
       await saleContract.setTime(data.SALE_START_DATE);
       let weiAmount = data.ETHER;
       let tokenAmount = data.ETHER.divToInt(data.TOKEN_RATE_ETHER).mul(10**data.DECIMALS)
       let initIncomeWalletBalance = await web3.eth.getBalance(treasuryContract.address);
       await saleContract.sendTransaction({value: weiAmount});
       tokenAmount.should.be.bignumber.equal(
           await tokenContract.balanceOf(accounts[0])
       );
       weiAmount.add(initIncomeWalletBalance).should.be.bignumber.equal(
           await web3.eth.getBalance(treasuryContract.address)
       );
       weiAmount.should.be.bignumber.equal(
           await saleContract.weiRaised()
       );
   });

   it('Check buyTokens', async () => {
       await saleContract.setTime(data.SALE_START_DATE);
       let weiAmount = data.ETHER;
       let tokenAmount = data.ETHER.divToInt(data.TOKEN_RATE_ETHER).mul(10**data.DECIMALS)
       await saleContract.buyTokens({value: weiAmount});
       tokenAmount.should.be.bignumber.equal(
           await tokenContract.balanceOf(accounts[0])
       );
   });

});
