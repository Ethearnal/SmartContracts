let data = require('../data.js');
let EthearnalRepToken = artifacts.require('EthearnalRepToken');
let EthearnalRepTokenCrowdsale = artifacts.require('EthearnalRepTokenCrowdsale');
let EthearnalRepTokenCrowdsaleMock = artifacts.require('EthearnalRepTokenCrowdsaleMock');
let Treasury = artifacts.require('Treasury');


async function deployTestContracts(accounts) {
    let tokenContract = await EthearnalRepToken.new();
    let owners = [
        accounts[0],
        accounts[1]
    ];
    let teamTokenWallet = accounts[2];
    let treasuryContract = await Treasury.new(teamTokenWallet);
    await treasuryContract.setupOwners(owners);
    let saleContract = await EthearnalRepTokenCrowdsaleMock.new(
        owners,
        tokenContract.address,
        treasuryContract.address,
        teamTokenWallet
    );
    await treasuryContract.setCrowdsaleContract(saleContract.address);
    tokenContract.transferOwnership(saleContract.address);
    await saleContract.setEtherRateUsd(data.ETHER_RATE_USD);
    return {
        tokenContract: tokenContract,
        saleContract: saleContract,
        teamTokenWallet: teamTokenWallet,
        treasuryContract: treasuryContract
    }
}

async function deployTestTokenContract() {
    let tokenContract = await EthearnalRepToken.new();
    return tokenContract;
}

async function deployTestTreasuryContract(owners, teamTokenWallet) {
    let treasuryContract = await Treasury.new(teamTokenWallet);
    await treasuryContract.setupOwners(owners);
    return treasuryContract;
}

module.exports = {
    deployTestContracts: deployTestContracts,
    deployTestTokenContract: deployTestTokenContract,
    deployTestTreasuryContract: deployTestTreasuryContract,
}
