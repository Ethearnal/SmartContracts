pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './EthearnalRepToken.sol';
import './Treasury.sol';
import "./MultiOwnable.sol";

contract EthearnalRepTokenCrowdsale is MultiOwnable {
    using SafeMath for uint256;

    /* *********************
     * Variables & Constants
     */

    // Token Contract
    EthearnalRepToken public token;

    // Ethereum rate, how much USD does 1 ether cost
    // The actual value is set by setEtherRateUsd
    uint256 etherRateUsd = 300;

    // Token price in Ether, 1 token is 0.5 USD, 3 decimals
    uint256 public tokenRateUsd = (1 * 1000) / uint256(2);

    // Mainsale Start Date (11 Nov 16:00 UTC)
    uint256 public constant saleStartDate = 1510416000;

    // Mainsale End Date (11 Dec 16:00 UTC)
    uint256 public constant saleEndDate = 1513008000;

    // How many tokens generate for the team, ratio with 3 decimals digits
    uint256 public constant teamTokenRatio = uint256(1 * 1000) / 3;

    // Crowdsale State
    enum State {
        BeforeMainSale, // pre-sale finisehd, before main sale
        MainSale, // main sale is active
        MainSaleDone, // main sale done, ICO is not finalized
        Finalized // the final state till the end of the world
    }

    // Hard cap for total sale
    uint256 public saleCapUsd = 30 * (10**6);

    // Money raised totally
    uint256 public weiRaised = 0;

    // This event means everything is finished and tokens
    // are allowed to be used by their owners
    bool public isFinalized = false;

    // Wallet to send team tokens
    address public teamTokenWallet = 0x0;

    // money received from each customer
    mapping(address => uint256) public raisedByAddress;

    // whitelisted investors
    mapping(address => bool) public whitelist;
    // how many whitelisted investors
    uint256 public whitelistedInvestorCounter;


    // Extra money each address can spend each hour
    uint256 hourLimitByAddressUsd = 1000;

    // Wallet to store all raised money
    Treasury public treasuryContract = Treasury(0x0);

    /* *******
     * Events
     */
    
    event ChangeReturn(address recipient, uint256 amount);
    event TokenPurchase(address buyer, uint256 weiAmount, uint256 tokenAmount);
    /* **************
     * Public methods
     */

    function EthearnalRepTokenCrowdsale(
        address[] _owners,
        address _treasuryContract,
        address _teamTokenWallet
    ) {
        require(_owners.length > 1);
        require(_treasuryContract != 0x0);
        require(_teamTokenWallet != 0x0);
        
        treasuryContract = Treasury(_treasuryContract);
        teamTokenWallet = _teamTokenWallet;
        setupOwners(_owners);
    }

    function() public payable {
        if (whitelist[msg.sender]) {
            buyForWhitelisted();
        } else {
            buyTokens();
        }
    }

    function setTokenContract(address _token) public onlyOwner {
        require(_token != 0x0 && token == address(0));
        require(EthearnalRepToken(_token).owner() == address(this));
        require(EthearnalRepToken(_token).totalSupply() == 0);
        token = EthearnalRepToken(_token);
    }

    function buyForWhitelisted() public payable {
        require(token != address(0));
        address whitelistedInvestor = msg.sender;
        require(whitelist[whitelistedInvestor]);
        uint256 weiToBuy = msg.value;
        require(weiToBuy > 0);
        uint256 tokenAmount = getTokenAmountForEther(weiToBuy);
        require(tokenAmount > 0);
        weiRaised = weiRaised.add(weiToBuy);
        raisedByAddress[whitelistedInvestor] = raisedByAddress[whitelistedInvestor].add(weiToBuy);
        assert(token.mint(whitelistedInvestor, tokenAmount));
        forwardFunds(weiToBuy);
        TokenPurchase(whitelistedInvestor, weiToBuy, tokenAmount);
    }

    function buyTokens() public payable {
        require(token != address(0));
        address recipient = msg.sender;
        State state = getCurrentState();
        uint256 weiToBuy = msg.value;
        require(
            (state == State.MainSale) &&
            (weiToBuy > 0)
        );
        weiToBuy = min(weiToBuy, getWeiAllowedFromAddress(recipient));
        require(weiToBuy > 0);
        weiToBuy = min(weiToBuy, convertUsdToEther(saleCapUsd).sub(weiRaised));
        require(weiToBuy > 0);
        uint256 tokenAmount = getTokenAmountForEther(weiToBuy);
        require(tokenAmount > 0);
        uint256 weiToReturn = msg.value.sub(weiToBuy);
        weiRaised = weiRaised.add(weiToBuy);
        raisedByAddress[recipient] = raisedByAddress[recipient].add(weiToBuy);
        if (weiToReturn > 0) {
            recipient.transfer(weiToReturn);
            ChangeReturn(recipient, weiToReturn);
        }
        assert(token.mint(recipient, tokenAmount));
        forwardFunds(weiToBuy);
        TokenPurchase(recipient, weiToBuy, tokenAmount);
    }

    function setEtherRateUsd(uint256 _rate) public onlyOwner {
        require(_rate > 0);
        etherRateUsd = _rate;
    }

    // TEST
    function finalizeByAdmin() public onlyOwner {
        finalize();
    }

    /* ****************
     * Internal methods
     */

    function forwardFunds(uint256 _weiToBuy) internal {
        treasuryContract.transfer(_weiToBuy);
    }

    // TESTED
    function convertUsdToEther(uint256 usdAmount) constant internal returns (uint256) {
        return usdAmount.mul(1 ether).div(etherRateUsd);
    }

    // TESTED
    function getTokenRateEther() public constant returns (uint256) {
        // div(1000) because 3 decimals in tokenRateUsd
        return convertUsdToEther(tokenRateUsd).div(1000);
    }

    // TESTED
    function getTokenAmountForEther(uint256 weiAmount) constant internal returns (uint256) {
        return weiAmount
            .div(getTokenRateEther())
            .mul(10 ** token.decimals());
    }

    // TESTED
    function isReadyToFinalize() internal returns (bool) {
        return(
            (weiRaised >= convertUsdToEther(saleCapUsd)) ||
            (getCurrentState() == State.MainSaleDone)
        );
    }

    // TESTED
    function min(uint256 a, uint256 b) internal returns (uint256) {
        return (a < b) ? a: b;
    }

    // TESTED
    function max(uint256 a, uint256 b) internal returns (uint256) {
        return (a > b) ? a: b;
    }

    // TESTED
    function ceil(uint a, uint b) internal returns (uint) {
        return ((a.add(b).sub(1)).div(b)).mul(b);
    }

    // TESTED
    function getWeiAllowedFromAddress(address _sender) internal returns (uint256) {
        uint256 secondsElapsed = getTime().sub(saleStartDate);
        uint256 fullHours = ceil(secondsElapsed, 3600).div(3600);
        fullHours = max(1, fullHours);
        uint256 weiLimit = fullHours.mul(convertUsdToEther(hourLimitByAddressUsd));
        return weiLimit.sub(raisedByAddress[_sender]);
    }

    function getTime() internal returns (uint256) {
        // Just returns `now` value
        // This function is redefined in EthearnalRepTokenCrowdsaleMock contract
        // to allow testing contract behaviour at different time moments
        return now;
    }

    // TESTED
    function getCurrentState() internal returns (State) {
        return getStateForTime(getTime());
    }

    // TESTED
    function getStateForTime(uint256 unixTime) internal returns (State) {
        if (isFinalized) {
            // This could be before end date of ICO
            // if hard cap is reached
            return State.Finalized;
        }
        if (unixTime < saleStartDate) {
            return State.BeforeMainSale;
        }
        if (unixTime < saleEndDate) {
            return State.MainSale;
        }
        return State.MainSaleDone;
    }

    // TESTED
    function finalize() private {
        if (!isFinalized) {
            require(isReadyToFinalize());
            isFinalized = true;
            mintTeamTokens();
            token.unlock();
            treasuryContract.setCrowdsaleFinished();
        }
    }

    // TESTED
    function mintTeamTokens() private {
        // div by 1000 because of 3 decimals digits in teamTokenRatio
        var tokenAmount = token.totalSupply().mul(teamTokenRatio).div(1000);
        token.mint(teamTokenWallet, tokenAmount);
    }


    function whitelistInvestor(address _newInvestor) public onlyOwner {
        if(!whitelist[_newInvestor]) {
            whitelist[_newInvestor] = true;
            whitelistedInvestorCounter++;
        }
    }
    function whitelistInvestors(address[] _investors) external onlyOwner {
        require(_investors.length <= 250);
        for(uint8 i=0; i<_investors.length;i++) {
            address newInvestor = _investors[i];
            if(!whitelist[newInvestor]) {
                whitelist[newInvestor] = true;
                whitelistedInvestorCounter++;
            }
        }
    }
    function blacklistInvestor(address _investor) public onlyOwner {
        if(whitelist[_investor]) {
            delete whitelist[_investor];
            if(whitelistedInvestorCounter != 0) {
                whitelistedInvestorCounter--;
            }
        }
    }

}
