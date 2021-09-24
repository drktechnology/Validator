require('dotenv').config()

const HDWalletProvider = require('truffle-hdwallet-provider');

const deployers = {
  localhost: {
    endpoint: process.env.LOCAL_ENDPOINT,
    pkey: process.env.LOCAL_PKEY,
    network_id: process.env.LOCAL_NETWORK_ID
  },
  development: {
    endpoint: process.env.DEV_ENDPOINT,
    pkey: process.env.DEV_PKEY,
    network_id: process.env.DEV_NETWORK_ID
  },
  production: {
    endpoint: process.env.PRO_ENDPOINT,
    pkey: process.env.PRO_PKEY,
    network_id: process.env.PRO_NETWORK_ID
  },
}

module.exports = {
    networks: {
        localhost: {
          provider: () => new HDWalletProvider(deployers.localhost.pkey, deployers.localhost.endpoint),
          network_id: deployers.localhost.network_id,
          gas: 7800000
        },
        development: {
          provider: () => new HDWalletProvider(deployers.development.pkey, deployers.development.endpoint),
          network_id: deployers.development.network_id,
          gas: 7800000
        },
        production: {
          provider: () => new HDWalletProvider(deployers.production.pkey, deployers.production.endpoint),
          network_id: deployers.production.network_id,
          gas: 7800000
        }
    },
    compilers: {
        solc: {
            version: process.env.SOLC_VER
        }
    }
}
