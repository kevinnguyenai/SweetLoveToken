var SWLERC20 = artifacts.require("./SWLToken.sol");

module.exports = async function(deployer, network, accounts) {
    if (network == "development") {
        await deployer.deploy(SWLERC20);
    }
    else if (network == "rinkeby") {
        await deployer.deploy(SWLERC20);
    } else if (network == "kovan") {
        await deployer.deploy(SWLERC20);
    } else if (network == "serenity") {
        await deployer.deploy(SWLERC20);
    } else {
        // used in future when deploy Rinkeby or Production mainnet
    }
};