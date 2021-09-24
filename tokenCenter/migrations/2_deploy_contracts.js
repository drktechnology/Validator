const Contract_name = 'TokenCenter'
const TokenCenter = artifacts.require('./' + Contract_name + '.sol');

// const Web3 = require('web3')
// const Utils = Web3.utils

module.exports = async function (deployer) {
    // await deployer.deploy(
    //     Token,
    //     'test',
    //     'test',
    //     6,
    //     1000000,
    //     true
    // )
    await deployer.deploy(
        TokenCenter
    )
}