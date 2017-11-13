# To deploy:
1. run `make_flat.sh`
2. Deploy `EthearnalRepToken_flat.sol`
3. Deploy `Treasury_flat.sol` with constructor argument of team's multisig wallet where funds will be collected
4. Call `treasuryContract_flat`.`setupOwners` with an array of multiple owners of the contract who can call sensitive functions
5. Modify values in `EthearnalRepTokenCrowdsale_flat`:
    uint256 etherRateUsd = 300;    
    // Mainsale Start Date (11 Nov 16:00 UTC)
    uint256 public constant saleStartDate = 1510416000;

    // Mainsale End Date (11 Dec 16:00 UTC)
    uint256 public constant saleEndDate = 1513008000;

5. Deploy `EthearnalRepTokenCrowdsale_flat` contract with constructor arguments:
array of owners,
tokenContract address,
treasuryContract address,
team multisig wallet where tokens will be allocated
Example:
["0x0039f22efb07a647557c7c5d17854cfd6d489ef3", "0x94fc020913ea347eff7dd6493c3e5fcc72172ac1"], "0x96ee88a6d189e15634f38c5e6a5ba82fd02e9d77", "0x94fc020913ea347eff7dd6493c3e5fcc72172ac1", "0x0039f22efb07a647557c7c5d17854cfd6d489ef3"
6. Deploy `VotingProxy_flat` with constructor arguments:
treasury contract address,
token contract address
7. call `treasuryContract.setVotingProxy(votingProxyContract.address)`
8. call `treasuryContract.setCrowdsaleContract(saleContract.address)`
9. call `treasuryContract.setTokenContract(tokenContract.address)`
10. call `tokenContract.transferOwnership(saleContract.address)`
11. call `saleContract.setEtherRateUsd(CURRENT_ETHER_RATE_USD)` IF USD_ETHER rate has changed


# To verify on etherscan
encodeConstructor Parameters by using:
```
let valuesICO = [["0x0039f22efb07a647557c7c5d17854cfd6d489ef3", "0x94fc020913ea347eff7dd6493c3e5fcc72172ac1"], "0x96ee88a6d189e15634f38c5e6a5ba82fd02e9d77", "0x94fc020913ea347eff7dd6493c3e5fcc72172ac1", "0x0039f22efb07a647557c7c5d17854cfd6d489ef3"]
let encodeICO = web3.eth.abi.encodeParameters(['address[]', 'address', 'address', 'address'], values2);

let valuesVotingProxy = ["0x94fc020913ea347eff7dd6493c3e5fcc72172ac1","0x96ee88a6d189e15634f38c5e6a5ba82fd02e9d77"]
let encodeVotingProxy = web3.eth.abi.encodeParameters(['address', 'address'], valuesVotingProxy);
```

# Testnet deployments:
Token: https://kovan.etherscan.io/address/0x96ee88a6d189e15634f38c5e6a5ba82fd02e9d77#code
Treasury: https://kovan.etherscan.io/address/0x94fc020913ea347eff7dd6493c3e5fcc72172ac1
ICO: https://kovan.etherscan.io/address/0x09226ccec39cf38cd47ccb4f0e9cf54a30e9a136#code
VotingProxy: https://kovan.etherscan.io/address/0x9b49a4398c1e4be1f3d2ae2ceb208ee5a5df2e45