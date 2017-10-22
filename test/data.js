let moment = require('moment');
let big = require('./util/bigNum.js').big;

const DECIMALS = big(18);
const ETHER = big(10).toPower(18);
const ETHER_RATE_USD = big(300);
const TOKEN_RATE_USD = big(1 * 1000).divToInt(2);
const HOUR_LIMIT_BY_ADDRESS_USD = 1000

function convertUsdToEther(usdAmount) {
    return big(usdAmount).mul(ETHER).divToInt(ETHER_RATE_USD)
}

function getTokenRateEther() {
    return convertUsdToEther(TOKEN_RATE_USD).divToInt(1000);
}

module.exports = {
    ETHER: ETHER,
    DECIMALS: DECIMALS,
    TOKEN_NAME: 'Ethearnal Rep Token',
    TOKEN_SYMBOL: 'ERT',
    TOTAL_SUPPLY: big(1).mul(10**9).mul(10**DECIMALS),
    SALE_START_DATE: moment('2017-11-11T16:00:00Z').unix(),
    SALE_END_DATE: moment('2017-12-11T16:00:00Z').unix(),
    TOKEN_RATE_ETHER: getTokenRateEther(),
        //TOKEN_RATE_USD.mul(ETHER).divToInt(ETHER_RATE_USD).divToInt(1000)
    SALE_CAP: convertUsdToEther(big(30).mul(10**6)),//.mul(ETHER).divToInt(ETHER_RATE_USD),
    ETHER_RATE_USD: ETHER_RATE_USD,
    TOKEN_RATE_USD: TOKEN_RATE_USD,
    SALE_STATE: {
        'BeforeMainSale': 0,
        'MainSale': 1,
        'MainSaleDone': 2,
        'Finalized': 3
    },
    getTokenRateEther: getTokenRateEther,
    convertUsdToEther: convertUsdToEther,
    TEAM_TOKEN_RATIO: big(1 * 1000).divToInt(3),
    HOUR_LIMIT_BY_ADDRESS_WEI: convertUsdToEther(HOUR_LIMIT_BY_ADDRESS_USD)
}
