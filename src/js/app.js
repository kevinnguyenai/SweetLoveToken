App = {
    web3Provider: null,
    contracts: {},
    ethToWei: function(eth) {

        return new BN(toWei(eth.toString(), 'ether'));
    },

    weiToEth: function(wei) {
        return web3.fromWei(wei, 'ether');
    },

    init: async function() {

        return App.initWeb3();
    },

    initWeb3: async function() {
        // Modern Dapp browser
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch (error) {
                console.log(error);
            }
        } else
        // Initialize web3 and set the provider to the testRPC.
        if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        } else {
            // set the provider you want from Web3.providers
            App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');

        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function() {
        $.getJSON('SWLToken.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract.
            var TutorialTokenArtifact = data;
            App.contracts.SWLToken = TruffleContract(TutorialTokenArtifact);

            // Set the provider for our contract.
            App.contracts.SWLToken.setProvider(App.web3Provider);

            // Use our contract to retieve and mark the adopted pets.
            return App.getBalances();
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '#transferButton', App.handleTransfer);
    },

    handleTransfer: function(event) {
        event.preventDefault();

        var amount = parseInt($('#SWTTransferAmount').val());
        var toAddress = $('#SWTTransferAddress').val();

        console.log(`Transfer ${amount} SWT to + ${toAddress}`);

        var ERC20Instance;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.ERC20.deployed().then(function(instance) {
                ERC20Instance = instance;

                return ERC20Instance.transfer(toAddress, amount, { from: account, gas: 100000 });
            }).then(function(result) {
                alert('Transfer Successful!');
                return App.getBalances();
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },

    getBalances: function() {
        console.log('Getting balances...');

        var ERC20Instance;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.ERC20.deployed().then(function(instance) {
                ERC20Instance = instance;

                return ERC20Instance.balanceOf(account);
            }).then(function(result) {
                balance = App.weiToEth(result);
                $('#SWTBalance').text(balance);
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    }

};

$(function() {
    $(window).load(function() {
        App.init();
    });
});