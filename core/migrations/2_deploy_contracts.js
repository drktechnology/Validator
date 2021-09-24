const Contract_name = 'Validator'
const Validator = artifacts.require('./' + Contract_name + '.sol');

const Web3 = require('web3')
const Utils = Web3.utils

// const path= {
//     input: process.env.FLATTENER_INPUT,
//     output: process.env.FLATTENER_OUTPUT
// }

module.exports = async function (deployer) {
    const name = 'RET Validator Sharing'
    const symbol = 'RVS'
    const decimals = 18

    const _genesisValidators = [
        '0x95e2fcBa1EB33dc4b8c6DCBfCC6352f0a253285d',
        '0xDD6aE9f37BA5e7c35c20BA94528DcF008a5a0E9A',
        '0xa6A482918C7C9d6Ec21Df18A8c8F5C6FE60B5A44'
    ]
    const _genesisCoinbases = [
        '0x887C5f6E89D75c6A9Cc238246B2e6ddde9a2C6f3',
        '0x45490d60438386471Cad5C409B5E115068dfDa95',
        '0x6F43de103Cfb736969D4A97D4554CFf90C47993a'
    ]
    const _genesisRVSBalances = [
        Utils.toWei('1', 'ether'),Utils.toWei('1', 'ether'),Utils.toWei('2', 'ether')
    ]

    // all _premineAddresses got same balance at genesis block
    const _premineAddresses = _genesisValidators
    const _premineBalances = [
        Utils.toWei('1', 'ether'),Utils.toWei('1', 'ether'),Utils.toWei('2', 'ether')
    ]

    const instance = await deployer.deploy(
        Validator,
        _genesisValidators,
        _genesisCoinbases,
        _genesisRVSBalances,
        name,
        symbol,
        decimals,
        _premineAddresses,
        _premineBalances
    )

    // constructor params -> filename.txt
    // NEED TO BE UPGRADED, READ FROM build/ abi
    // i.e abi.rawEncode([ "address", "address[]", "uint", "uint[]"], [ addressValue, addressArr, uintValue, uintArr])
    // const encoded = abi.rawEncode([], [])
    // const hexString = encoded.toString('hex')
    // write.sync(path.output + Contract_name +'.txt', hexString, {overwrite: true})

    // const cmd = 'truffle-flattener ' + path.input + Contract_name + '.sol --output ' + path.output + Contract_name + '.sol'
    // exec(cmd)
}