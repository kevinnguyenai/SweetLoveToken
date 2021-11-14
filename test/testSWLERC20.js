const SWLToken = artifacts.require("SWLToken");
const utils = require('./helpers/utils');
var expect = require('chai').expect;
var should = require('chai').should;
var web3 = require('web3');
const Users = require('./fixtures/Users.json');

contract("SWLToken", (accounts) => {
    const owner = accounts[0];
    const alice = accounts[3];
    const bob = accounts[4];
    const ken = accounts[5];
    const address0 = '0x0';
    let contractInstance;

    beforeEach(async() => {
        contractInstance = await SWLToken.new();
    });

    /**
     * @context owner should mint new token
     * @dev KevinNguyen
     */
    context('owner should mint new token', async() => {
        it('an amount of token mint by Owner', async() => {
            const minter = await contractInstance.mint(alice, web3.utils.toWei(Users.value[0].payable, 'ether'), { from: owner });
            expect(minter.receipt.status).is.equal(true);
        });
    });


    /**
     * @context others shouldn't mint token
     * @dev KevinNguyen
     */
    context('others should not mint token', async() => {
        it('others should not mint to their address', async() => {
            await utils.shouldThrow(contractInstance.mint(alice, web3.utils.toWei(Users.value[1].payable, 'ether'), { from: alice }));
        });
    });

    /**
     * @context  anyone can burn their token
     * @dev KevinNguyen
     */
    context('anyone can burn token ', async() => {
        beforeEach('ensure owner and others have enough token to burn', async() => {
            await contractInstance.mint(owner, web3.utils.toWei(Users.value[0].mintable, 'ether'), { from: owner });
            await contractInstance.mint(alice, web3.utils.toWei(Users.value[1].mintable, 'ether'), { from: owner });
        });

        it('owner can burn some token', async() => {
            const burnerOwner = await contractInstance.burn(web3.utils.toWei(Users.value[0].burnable, 'ether'), { from: owner });
            expect(burnerOwner.receipt.status).is.equal(true);
        });

        it('anyone can burn token of them', async() => {
            const balanceAlice = await contractInstance.balanceOf(alice);
            expect(web3.utils.fromWei(balanceAlice, 'ether')).is.equal(Users.value[1].mintable);
            const burnerAlice = await contractInstance.burn(web3.utils.toWei(Users.value[1].burnable, 'ether'), { from: alice });
            expect(burnerAlice.receipt.status).is.equal(true);
        });

    });


    /**
     * @context anyone can be able transfer(drop token) to anyone
     * @dev KevinNguyen
     */
    context('anyone can be able transfer to anyone', async() => {
        beforeEach('ensure account have balance to transfer', async() => {
            await contractInstance.mint(alice, web3.utils.toWei(Users.value[1].mintable, 'ether'), { from: owner });
        });
        it('can transfer success to other', async() => {
            const aliceTransfer = await contractInstance.transfer(bob, web3.utils.toWei(Users.value[1].payable, 'ether'), { from: alice });
            expect(aliceTransfer.receipt.status).is.equal(true);
        });

        it('cannot transfer exceed your balance to other', async() => {
            await utils.shouldThrow(contractInstance.transfer(bob, web3.utils.toWei(Users.value[1].unburnable, 'ether'), { from: alice }));

        });

    });

    /**
     * @context alice can approve for bob withraw amount of approved token from her
     * @dev KevinNguyen
     */
    context('spender can approve for store to withdraw', async() => {
        beforeEach('ensure spender have token to approve', async() => {
            await contractInstance.mint(alice, web3.utils.toWei(Users.value[1].mintable, 'ether'), { from: owner });
        });

        it('spender be able approve for store withdraw', async() => {
            const spender = await contractInstance.approve(bob, web3.utils.toWei(Users.value[1].payable, 'ether'), { from: alice });
            expect(spender.receipt.status).is.equal(true);
            const store = await contractInstance.transferFrom(alice, bob, web3.utils.toWei(Users.value[1].payable, 'ether'), { from: bob });
            expect(store.receipt.status).is.equal(true);
        });

        it('spender be able approve but store cannot withdraw higher than approved amount', async() => {
            const spender = await contractInstance.approve(bob, web3.utils.toWei(Users.value[1].payable, 'ether'), { from: alice });
            expect(spender.receipt.status).is.equal(true);
            await utils.shouldThrow(contractInstance.transferFrom(alice, bob, web3.utils.toWei(Users.value[1].unpayable, 'ether'), { from: bob }));
        });

        it('store unable to TransferForm token from address 0', async() => {
            await utils.shouldThrow(contractInstance.transferFrom(address0, web3.utils.toWei(Users.value[1].payable, 'ether'), { from: alice }));
        });

        it('store unable to TransferForm token from unapprove amount of token from other account', async() => {
            await utils.shouldThrow(contractInstance.transferFrom(bob, web3.utils.toWei(Users.value[1].payable, 'ether'), { from: alice }));
        });

    });

});