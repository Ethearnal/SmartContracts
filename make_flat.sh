
#!/usr/bin/env bash

#pip3 install solidity-flattener --no-cache-dir -U
rm -rf flat/*
solidity_flattener --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity contracts/EthearnalRepToken.sol | sed "1s/.*/pragma solidity ^0.4.18;/" > flat/EthearnalRepToken_flat.sol
solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/EthearnalRepTokenCrowdsale.sol | sed "1s/.*/pragma solidity ^0.4.18;/" > flat/EthearnalRepTokenCrowdsale_flat.sol
solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/Treasury.sol | sed "1s/.*/pragma solidity ^0.4.18;/" > flat/Treasury_flat.sol
solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/VotingProxy.sol | sed "1s/.*/pragma solidity ^0.4.18;/" > flat/VotingProxy_flat.sol

solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/RefundInvestorsBallot.sol | sed "1s/.*/pragma solidity ^0.4.18;/" > flat/RefundInvestorsBallot_flat.sol
solidity_flattener  --solc-paths=zeppelin-solidity=$(pwd)/node_modules/zeppelin-solidity/ contracts/Ballot.sol | sed "1s/.*/pragma solidity ^0.4.18;/" > flat/IncreaseWithdrawalBallot_flat.sol
