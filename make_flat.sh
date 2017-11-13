
#!/usr/bin/env bash

#pip3 install solidity-flattener --no-cache-dir -U
rm -rf flat/*
solidity_flattener --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity contracts/EthearnalRepToken.sol --out flat/EthearnalRepToken_flat.sol
solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/EthearnalRepTokenCrowdsale.sol --out flat/EthearnalRepTokenCrowdsale_flat.sol
solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/Treasury.sol --out flat/Treasury_flat.sol
solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/VotingProxy.sol --out flat/VotingProxy_flat.sol

solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/RefundInvestorsBallot.sol --out flat/RefundInvestorsBallot_flat.sol
solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/Ballot.sol --out flat/IncreaseWithdrawalBallot_flat.sol
