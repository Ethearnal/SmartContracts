let data = require('../data.js');

function getTokenRateEther() {
    return data.TOKEN_RATE_USD.mul(data.ETHER).divToInt(data.ETHER_RATE_USD).divToInt(1000);
}

module.exports = {
    getTokenRateEther: getTokenRateEther
}
