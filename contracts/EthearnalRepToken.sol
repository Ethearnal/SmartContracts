pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import './LockableToken.sol';

contract EthearnalRepToken is MintableToken, LockableToken {
    string public constant name = 'Ethearnal Rep Token';
    string public constant symbol = 'ERT';
    uint8 public constant decimals = 18;
}
