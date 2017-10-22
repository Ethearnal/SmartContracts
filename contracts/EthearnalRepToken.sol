pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract LockableToken is StandardToken, Ownable {
    bool public isLocked = true;

    function unlock() public onlyOwner {
        isLocked = false;
    }

    function transfer(address _who, uint256 _amount) public returns (bool) {
        require(!isLocked);
        return super.transfer(_who, _amount);
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(!isLocked);
        super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        require(!isLocked);
        super.approve(_spender, _value);
    }
}

contract EthearnalRepToken is MintableToken, LockableToken {
    string public constant name = 'Ethearnal Rep Token';
    string public constant symbol = 'ERT';
    uint256 public constant decimals = 18;
}
