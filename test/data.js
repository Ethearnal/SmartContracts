let moment = require('moment');
let big = require('./util/bigNum.js').big;

const DECIMALS = big(18);
const ETHER = big(10).toPower(18);
const ETHER_RATE_USD = big(300);
const TOKEN_RATE_USD = big(1 * 1000).divToInt(2);

module.exports = {
    ETHER: ETHER,
    DECIMALS: DECIMALS,
    TOKEN_NAME: 'Ethearnal Rep Token',
    TOKEN_SYMBOL: 'ERT',
    TOTAL_SUPPLY: big(1).mul(10**9).mul(10**DECIMALS),
    SALE_START_DATE: moment('2017-11-11T16:00:00Z').unix(),
    SALE_END_DATE: moment('2017-12-11T00:16:00Z').unix(),
    TOKEN_RATE_ETHER: (
        TOKEN_RATE_USD.mul(ETHER).divToInt(ETHER_RATE_USD).divToInt(1000)
    ),
    SALE_CAP: big(30).mul(10**6).mul(ETHER).divToInt(ETHER_RATE_USD),
    ETHER_RATE_USD: ETHER_RATE_USD,
    TOKEN_RATE_USD: TOKEN_RATE_USD,
}
