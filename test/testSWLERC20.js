const SWLToken = artifacts.require("SWLToken");
const utils = require('./helpers/utils');
var expect = require('chai').expect;
const Users = [{
        name: "Owner",
        address: null,
        totalSWT: null,
        mintable: 1000,
        burnable: 1000
    },
    {
        name: "Alice",
        address: null,
        totalSWT: null,
        payable: 20,
        mintable: 1000,
        burnable: 1000
    },
    {
        name: "Bob",
        address: null,
        totalSWT: null,
        payable: 40,
        mintable: 1000,
        burnable: 1000
    }
];

contract("ERC20", (accounts) => {
    let owner = accounts[0];
    let alice = accounts[3];
    let bob = accounts[4];
    let contractInstance;

    beforeEach(async() => {
        contractInstance = await SWLToken.new();
    });

    /**
     * owner should mint new token
     * @dev Kevin
     * @param amount
     */

    /**
     * alice shouldn't mint token
     * @dev Kevin
     * @param amount
     */


    /**
     * owner should burn some token 
     * @dev Kevin
     * @param amount
     */

    /**
     * alice shouldn't burn token
     * @dev Kevin
     * @param amount
     */


    /**
     * owner be able transfer(drop  token) to alice and bob
     * @dev Kevin
     * @param amount
     */


    /**
     * alice transfer direct to bob
     * @dev Kevin
     * @param amount
     */
    // alice should transfer small amount of her's token to bob
    // alice shouldn't transfer amount of token greater than her's token to bob

    /**
     * alice can approve for bob withraw amount of approved token from her
     * @dev Kevin
     * @param amount
     */
    // alice should aprove small amount of her's token to bob
    // alice shouldn't approve amount of token greater than her's token to bob


    /**
     * alice can deposit some ETH to mint token
     * @dev Kevin
     * @param etherAmount
     */

    /**
     * alice can withdraw some SWT to ETH
     * @dev Kevin
     * @param swtAmount
     */


});