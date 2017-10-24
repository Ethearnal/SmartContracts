pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract LockableToken is StandardToken, Ownable {
    bool public isLocked = true;
    mapping (address => uint256) public lastMovement;


    function unlock() public onlyOwner {
        isLocked = false;
    }

    function transfer(address _to, uint256 _amount) public returns (bool) {
        require(!isLocked);
        lastMovement[msg.sender] = getTime();
        return super.transfer(_to, _amount);
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(!isLocked);
        lastMovement[msg.sender] = getTime();
        super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        require(!isLocked);
        super.approve(_spender, _value);
    }

    function getTime() internal returns (uint256) {
        // Just returns `now` value
        // This function is redefined in EthearnalRepTokenCrowdsaleMock contract
        // to allow testing contract behaviour at different time moments
        return now;
    }

}

contract EthearnalRepToken is MintableToken, LockableToken {
    string public constant name = 'Ethearnal Rep Token';
    string public constant symbol = 'ERT';
    uint256 public constant decimals = 18;
}
