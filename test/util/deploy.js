let data = require('../data.js');
let EthearnalRepToken = artifacts.require('EthearnalRepToken');
let EthearnalRepTokenCrowdsale = artifacts.require('EthearnalRepTokenCrowdsale');
let EthearnalRepTokenCrowdsaleMock = artifacts.require('EthearnalRepTokenCrowdsaleMock');
let TreasuryWallet = artifacts.require('TreasuryWallet');


async function deployTestContracts(accounts) {
    let tokenContract = await EthearnalRepToken.new();
    let owners = [
        accounts[0],
        accounts[1]
    ];
    let treasuryWallet = await TreasuryWallet.new();
    let teamTokenWallet = accounts[2];
    let saleContract = await EthearnalRepTokenCrowdsaleMock.new(
        owners,
        tokenContract.address,
        treasuryWallet.address,
        teamTokenWallet
    );
    await saleContract.setEtherRateUsd(data.ETHER_RATE_USD);
    return {
        tokenContract: tokenContract,
        saleContract: saleContract
    }
}

module.exports = {
    deployTestContracts: deployTestContracts
}
