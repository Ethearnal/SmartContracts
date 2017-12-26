pragma solidity ^0.4.15;


contract MultiOwnable {
    mapping (address => bool) public ownerRegistry;
    address[] owners;
    address public multiOwnableCreator = 0x0;

    function MultiOwnable() public {
        multiOwnableCreator = msg.sender;
    }

    function setupOwners(address[] _owners) public {
        // Owners are allowed to be set up only one time
        require(multiOwnableCreator == msg.sender);
        require(owners.length == 0);
        for(uint256 idx=0; idx < _owners.length; idx++) {
            require(
                !ownerRegistry[_owners[idx]] &&
                _owners[idx] != 0x0 &&
                _owners[idx] != address(this)
            );
            ownerRegistry[_owners[idx]] = true;
        }
        owners = _owners;
    }

    modifier onlyOwner() {
        require(ownerRegistry[msg.sender] == true);
        _;
    }

    function getOwners() public returns (address[]) {
        return owners;
    }
}
