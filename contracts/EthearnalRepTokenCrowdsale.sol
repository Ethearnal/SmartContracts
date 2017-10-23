pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './EthearnalRepToken.sol';
import './TreasuryWallet.sol';


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
    uint256 public totalRaised = 0;

    // This event means everything is finished and tokens
    // are allowed to be used by their owners
    bool public isFinalized = false;

    // Wallet to send team tokens
    address public teamTokenWallet = 0x0;

    // money received from each customer
    mapping(address => uint256) public raisedByAddress;

    // Extra money each address can spend each hour
    uint256 hourLimitByAddressUsd = 1000;

    // Wallet to store all raised money
    TreasuryWallet public treasuryWallet = TreasuryWallet(0x0);

    /* *******
     * Events
     */
    
    event ChangeReturn(address recipient, uint256 amount);
    event TokenPurchase(address buyer, address recipient, uint256 weiAmount, uint256 tokenAmount);

    /* **************
     * Public methods
     */

    function EthearnalRepTokenCrowdsale(
        address[] _owners,
        address _token,
        address _treasuryWallet,
        address _teamTokenWallet
    ) {
        require(_owners.length > 1);
        require(_token != 0x0);
        require(_treasuryWallet != 0x0);
        require(_teamTokenWallet != 0x0);
        token = EthearnalRepToken(_token);
        treasuryWallet = TreasuryWallet(_treasuryWallet);
        teamTokenWallet = _teamTokenWallet;
        setupOwners(_owners);
    }

    function() public payable {
        buyTokens(msg.sender);
    }

    function buyTokens(address recipient) public payable {
        require(recipient != address(0));

        State state = getCurrentState();
        uint256 weiToBuy = msg.value;
        require(
            (state == State.MainSale) &&
            (weiToBuy > 0)
        );
        weiToBuy = min(weiToBuy, getWeiAllowedFromAddress(msg.sender));
        require(weiToBuy > 0);
        weiToBuy = min(weiToBuy, convertUsdToEther(saleCapUsd).sub(totalRaised));
        require(weiToBuy > 0);

        uint256 tokenAmount = getTokenAmountForEther(weiToBuy);
        uint256 weiToReturn = msg.value.sub(weiToBuy);
        totalRaised = totalRaised.add(weiToBuy);
        raisedByAddress[msg.sender] = raisedByAddress[msg.sender].add(weiToBuy);
        if (weiToReturn > 0) {
            msg.sender.transfer(weiToReturn);
            ChangeReturn(msg.sender, weiToReturn);
        }
        token.mint(recipient, tokenAmount);
        TokenPurchase(msg.sender, recipient, weiToBuy, tokenAmount);
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

    // TESTED
    function convertUsdToEther(uint256 usdAmount) internal returns (uint256) {
        return usdAmount.mul(1 ether).div(etherRateUsd);
    }

    // TESTED
    function getTokenRateEther() internal returns (uint256) {
        // div(1000) because 3 decimals in tokenRateUsd
        return convertUsdToEther(tokenRateUsd).div(1000);
    }

    // TESTED
    function getTokenAmountForEther(uint256 weiAmount) internal returns (uint256) {
        return weiAmount
            .div(getTokenRateEther())
            .mul(10 ** token.decimals());
    }

    // TESTED
    function isReadyToFinalize() internal returns (bool) {
        return(
            (totalRaised >= convertUsdToEther(saleCapUsd)) ||
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
        return ((a + b - 1) / b) * b;
    }

    // TESTED
    function getWeiAllowedFromAddress(address _sender) internal returns (uint256) {
        uint256 secondsElapsed = getTime().sub(saleStartDate);
        uint256 fullHours = ceil(secondsElapsed, 3600) / 3600;
        fullHours = max(1, fullHours);
        uint256 weiLimit = fullHours * convertUsdToEther(hourLimitByAddressUsd);
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
            //treasuryWallet.unlock();
        }
    }

    // TESTED
    function mintTeamTokens() private {
        // div by 1000 because of 3 decimals digits in teamTokenRatio
        var tokenAmount = token.totalSupply().mul(teamTokenRatio).div(1000);
        token.mint(teamTokenWallet, tokenAmount);
    }
}
