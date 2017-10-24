let data = require('../data.js');
let EthearnalRepToken = artifacts.require('EthearnalRepTokenMock');
let EthearnalRepTokenCrowdsale = artifacts.require('EthearnalRepTokenCrowdsale');
let EthearnalRepTokenCrowdsaleMock = artifacts.require('EthearnalRepTokenCrowdsaleMock');
let Treasury = artifacts.require('Treasury');
//let TreasuryMock = artifacts.require('TreasuryMock');


async function deployTestContracts(accounts) {
    let tokenContract = await EthearnalRepToken.new();
    let owners = [
        accounts[0],
        accounts[1]
    ];
    let teamTokenWallet = accounts[2];
    let treasuryContract = await Treasury.new(teamTokenWallet, tokenContract.address);
    await treasuryContract.setupOwners(owners);
    let saleContract = await EthearnalRepTokenCrowdsaleMock.new(
        owners,
        tokenContract.address,
        treasuryContract.address,
        teamTokenWallet
    );
    await treasuryContract.setCrowdsaleContract(saleContract.address);
    await tokenContract.transferOwnership(saleContract.address);
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
    let tokenContract = await EthearnalRepToken.new();
    //let treasuryContract = await TreasuryMock.new(teamTokenWallet, tokenContract.address);
    let treasuryContract = await Treasury.new(teamTokenWallet, tokenContract.address);
    await treasuryContract.setupOwners(owners);
    return {
        tokenContract: tokenContract,
        treasuryContract:treasuryContract
    }
}

module.exports = {
    deployTestContracts,
    deployTestTokenContract,
    deployTestTreasuryContract
}
