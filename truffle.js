const { 
    projectId,
    alchemyKey,
    aura_rpc,
    aura_network_id,
    mnemonicPharse,
    mnemonicKeplr,
} = require('./.secret.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*" // Match any network id
        },
        // Useful for deploying to a public network.
        // NB: It's important to wrap the provider as a function.
        ropsten: {
            provider: () => new HDWalletProvider({
                mnemonic: {
                    phrase: mnemonicPharse
                },
                providerOrUrl: `https://ropsten.infura.io/v3/${projectId}`,
                numberOfAddresses: 2,
                shareNonce: true,
                derivationPath: "m/44'/1'/0'/0/"
            }),
            network_id: 3, // Ropsten's id
            gas: 5500000, // Ropsten has a lower block limit than mainnet
            confirmations: 2, // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
            skipDryRun: true // Skip dry run before migrations? (default: false for public nets )
        },
        rinkeby: {
            provider: () => new HDWalletProvider({
                mnemonic: {
                    phrase: mnemonicPharse
                },
                providerOrUrl: `https://rinkeby.infura.io/v3/${projectId}`,
                numberOfAddresses: 1,
                shareNonce: true
            }),
            network_id: 4, // Rinkeby's id
            gas: 5500000, // Rinkeby has a lower block limit than mainnet
            confirmations: 2, // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 300, // # of blocks before a deployment times out (minimum/default:50)
            skipDryRun: true, // Skip dry run before migrations ? ( default: false)
            networkCheckTimeout: 999999
        },
        rinkebyAlt: {
            provider: () => new HDWalletProvider({
                mnemonic: {
                    phrase: mnemonicPharse
                },
                providerOrUrl: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyKey}`,
                numberOfAddresses: 2,
                shareNonce: true,
                derivationPath: "m/44'/1'/0'/0/"
            }),
            network_id: 4, // Rinkeby's id
            gas: 5500000, // Rinkeby has a lower block limit than mainnet
            confirmations: 2, // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200, // # of blocks before a deployment times out (minimum/default:50)
            skipDryRun: true, // Skip dry run before migrations ? ( default: false)
            networkCheckTimeout: 999999
        },
        kovan: {
            provider: () => new HDWalletProvider({
                mnemonic: {
                    phrase: mnemonicPharse
                },
                providerOrUrl: `https://kovan.infura.io/v3/${projectId}`,
                numberOfAddresses: 2,
                shareNonce: true,
                derivationPath: "m/44'/1'/0'/0/"
            }),
            network_id: 42, // Kovan's id
            gas: 5500000, // Kovan has a lower block limit than mainnet
            confirmations: 2, // # of confs to wait between deployments. (default: 0)
            timeoutBlocks: 200, // # of blocks before a deployment times out (minimum/default:50)
            skipDryRun: true, // Skip dry run before migrations ? ( default: false)
            networkCheckTimeout: 999999
        },
        serenity: {
            provider: () => new HDWalletProvider({
                mnemonic: {
                    phrase: mnemonicKeplr 
                },
                providerOrUrl: `${aura_rpc}`
            }),
            network_id: `${aura_network_id}`,
            chain_id: `${aura_network_id}`
        },
    },
    mocha: {},
    compilers: {
        solc: {
            version: "^0.8.0"
        }
    }
};