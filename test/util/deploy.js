let data = require('../data.js');
let EthearnalRepToken = artifacts.require('EthearnalRepTokenMock');
let EthearnalRepTokenCrowdsale = artifacts.require('EthearnalRepTokenCrowdsale');
let EthearnalRepTokenCrowdsaleMock = artifacts.require('EthearnalRepTokenCrowdsaleMock');
let Treasury = artifacts.require('Treasury');
let TreasuryMock = artifacts.require('TreasuryMock');
let VotingProxy = artifacts.require('VotingProxy');


async function deployTestContracts(accounts) {
    let tokenContract = await EthearnalRepToken.new();
    let owners = [
        accounts[0],
        accounts[1]
    ];
    let teamTokenWallet = accounts[2];
    let treasuryContract = await Treasury.new(teamTokenWallet);
    await treasuryContract.setupOwners(owners);
    let votingProxyContract = await VotingProxy.new(treasuryContract.address, tokenContract.address);
    await treasuryContract.setVotingProxy(votingProxyContract.address);
    await treasuryContract.setTokenContract(tokenContract.address);
    let saleContract = await EthearnalRepTokenCrowdsaleMock.new(
        owners,
        treasuryContract.address,
        teamTokenWallet
    );
    await tokenContract.transferOwnership(saleContract.address);
    await saleContract.setTokenContract(tokenContract.address);
    await treasuryContract.setCrowdsaleContract(saleContract.address);
    await saleContract.setEtherRateUsd(data.ETHER_RATE_USD);
    return {
        tokenContract,
        saleContract,
        teamTokenWallet,
        treasuryContract,
        votingProxyContract
    }
}

async function deployTestTokenContract() {
    let tokenContract = await EthearnalRepToken.new();
    return tokenContract;
}

async function deployTestCrowdsaleContract(accounts){
    let tokenContract = await EthearnalRepToken.new();
    let owners = [
        accounts[0],
        accounts[1]
    ];
    let teamTokenWallet = accounts[2];
    let treasuryContract = await Treasury.new(teamTokenWallet, tokenContract.address);
    let saleContract = await EthearnalRepTokenCrowdsaleMock.new(
        owners,
        tokenContract.address,
        treasuryContract.address,
        teamTokenWallet
    );
    return {
        tokenContract,
        saleContract,
        teamTokenWallet,
        treasuryContract,
    }
}

async function deployTestTreasuryContract(owners, teamTokenWallet) {
    let treasuryContract = await TreasuryMock.new(teamTokenWallet);
    await treasuryContract.setupOwners(owners);
    return treasuryContract
}
async function deployVotingProxyContract(treasuryContract, tokenContract){
    let votingContract = await VotingProxy.new(treasuryContract, tokenContract);
    return votingContract
}
module.exports = {
    deployTestContracts,
    deployTestTokenContract,
    deployTestTreasuryContract,
    deployTestCrowdsaleContract,
    deployVotingProxyContract
}
