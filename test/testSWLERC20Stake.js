const SWLToken = artifacts.require("SWLToken");
const utils = require('./helpers/utils');
var expect = require('chai').expect;
var should = require('chai').should;
var web3 = require('web3');
const Users = require('./fixtures/Users.json');

contract("SWLToken", (accounts) => {
    let owner = accounts[0];
    let alice = accounts[3];
    let bob = accounts[4];
    let ken = accounts[5];
    let joe = accounts[6];
    let attacker = "0xF1BdCD9cB673378dEee00dc5848e5Abac3189D5D";
    let contractInstance;

    beforeEach(async() => {
        contractInstance = await SWLToken.new();
        await contractInstance.mint(alice, web3.utils.toWei(Users.value[0].payable, 'ether'), { from: owner });
        await contractInstance.mint(ken, web3.utils.toWei(Users.value[0].payable, 'ether'), { from: owner });
    });

    /**
     * @notice Method to evaluate check how many stake in pool
     * @context intital Contract with empty in pool of stake
     * @dev Kevin
     */
    it('anyone can check total Stakes', async() => {
        const result = await contractInstance._totalStakes({ from: alice });
        expect(result.toString()).is.equal('0');
    });

    /**
     * @notice Test anyone can stake token
     * @dev KevinNguyen
     */
    describe("anyone can stake token", async() => {
        context("anyone can stake token with enough balances", async() => {
            // stake token to pool
            it("stake to pool, amount of token was staked will burn", async() => {
                const aliceStaker = await contractInstance.createStake(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: alice });
                expect(aliceStaker.receipt.status).is.equal(true);
                const afteraliceBalance = await contractInstance.balanceOf(alice, { from: alice });
                expect(web3.utils.fromWei(afteraliceBalance, 'ether')).is.equal(Users.value[1].unstakeamount);
            });
        });

        context("anyone can't stake token without balances or not enough balance", async() => {
            // unable stake token to pool
            it("empty balance stake fail", async() => {
                await utils.shouldThrow(contractInstance.createStake(web3.utils.toWei(Users.value[2].stakeamount, 'ether'), { from: bob }));
            });

        });
    });


    /**
     * @notice Test staker can check their stake token amount
     * @dev KevinNguyen
     */
    context('staker can check their stake token amount', async() => {
        it('amount of token in pool match with stake amount', async() => {
            const aliceStaker = await contractInstance.createStake(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: alice });
            expect(aliceStaker.receipt.status).is.equal(true);
            const checkAlicebyAlice = await contractInstance._stakeOf.call(alice, { from: alice });
            expect(web3.utils.fromWei(checkAlicebyAlice, 'ether')).is.equal(Users.value[1].stakeamount);
        });

        it('other cannot check your stake amount', async() => {
            await utils.shouldThrow(contractInstance._stakeOf.call(alice, { from: bob }));

        });
    });

    /**
     * @notice staker can remove him out of stake pool
     * @context if staker in pool of stake and anyone can't remove other out of pool 
     * @dev KevinNguyen
     */
    context('Staker can let out of stake pool and redempt back token', async() => {
        it('staker remove out of pool and take back token', async() => {
            const aliceStaker = await contractInstance.createStake(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: alice });
            expect(aliceStaker.receipt.status).is.equal(true);
            const removeBuyAlice = await contractInstance.removeStake(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: alice });
            expect(removeBuyAlice.receipt.status).is.equal(true);
            const aliceBalance = await contractInstance.balanceOf.call(alice, { from: alice });
            expect(web3.utils.fromWei(aliceBalance, 'ether')).is.equal(Users.value[0].payable);
        });

        it('other cannot remove staker out of stake pool', async() => {
            const aliceStaker = await contractInstance.createStake(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: alice });
            expect(aliceStaker.receipt.status).is.equal(true);
            await utils.shouldThrow(contractInstance.removeStake.call(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: bob }));
        });
    });

    /**
     * @notice test there standalone owner speak a Distribute reward
     * @context  only owner can distribue reward
     * @dev KevinNguyen
     */
    context('owner distribute reward for staker in staker pool', () => {
        it('owner able to distribute reward to all staker', async() => {
            const aliceStaker = await contractInstance.createStake(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: alice });
            expect(aliceStaker.receipt.status).is.equal(true);
            const kenStaker = await contractInstance.createStake(web3.utils.toWei(Users.value[3].stakeamount, 'ether'), { from: ken });
            expect(kenStaker.receipt.status).is.equal(true);
            const adminRewardStaker = await contractInstance.distributeReward({ from: owner });
            expect(adminRewardStaker.receipt.status).is.equal(true);
            const aliceReward = await contractInstance._rewardOf.call(alice, { from: alice });
            expect(web3.utils.fromWei(aliceReward, 'ether')).is.not.equal('0');
            const kenReward = await contractInstance._rewardOf.call(ken, { from: alice });
            expect(web3.utils.fromWei(kenReward, 'ether')).is.not.equal('0');

        });

        it('anyone unable to distribute reward to staker', async() => {
            await utils.shouldThrow(contractInstance.distributeReward({ from: alice }));
        });
    });

    /**
     * @notice test staker earn when sys transaction from Alice to Bob
     * @context in case ken earn enough reward from system (only Ken in pool)
     * in case ken and Alice in pool staker and transaction from Owner to Bob
     * @dev 
     */
    context('Staker can earn SWL token when system have transfer', async() => {
        it('staker earn enough token from engine reward', async() => {
            const KenStaker = await contractInstance.createStake(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: ken });
            expect(KenStaker.receipt.status).is.equal(true);
            const AliceTransferBob = await contractInstance.transfer(bob, web3.utils.toWei(Users.value[1].payable), { from: alice });
            expect(AliceTransferBob.receipt.status).is.equal(true);
            const KenBalance = await contractInstance.balanceOf.call(ken, { from: ken });
            expect(web3.utils.fromWei(KenBalance, 'ether')).is.equal((Users.value[3].stakeearn).toString());
        });

        it('random staker will be reward', async() => {
            const AliceStaker = await contractInstance.createStake(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: alice });
            expect(AliceStaker.receipt.status).is.equal(true);
            const KenStaker = await contractInstance.createStake(web3.utils.toWei(Users.value[1].stakeamount, 'ether'), { from: ken });
            expect(KenStaker.receipt.status).is.equal(true);
            const OwnerTransferBob = await contractInstance.transfer(bob, web3.utils.toWei(Users.value[1].payable), { from: owner });
            expect(OwnerTransferBob.receipt.status).is.equal(true);
            const AliceBalance = await contractInstance.balanceOf.call(alice, { from: alice });
            const KenBalance = await contractInstance.balanceOf.call(ken, { from: ken });
            expect(AliceBalance, KenBalance).satisfy(async() => {
                if (web3.utils.fromWei(AliceBalance, 'ether') == (Users.value[1].stakeearn).toString()) {
                    return true;
                } else
                if (web3.utils.fromWei(KenBalance, 'ether') == (Users.value[3].stakeearn).toString()) {
                    return true;
                } else {
                    return false;
                }
            });


        });
    });

});