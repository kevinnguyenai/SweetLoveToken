// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../base/ISWLToken.sol";
import "../base/ERC20.sol";
import "../base/ERC20Capped.sol";
import "../base/ERC20PresetMinterPauser.sol";
import "../erc/utils/SafeMath.sol";
import "../erc/access/Ownable.sol";


/**
 * SWL is Sweet Love Token which will used to user using in game
 * @dev KevinNguyen
 */

contract SWLToken is ISWLToken, ERC20Capped, ERC20PresetMinterPauser, Ownable {
    
    constructor() ERC20PresetMinterPauser("Sweet Love Token", "SWL") ERC20Capped(100000000e18) {
        _mint(_msgSender(), 2000000e18);
    }
    using SafeMath for uint256;
    /**
     * Overide _beforeTokenTransfer 
     * @dev KevinNguyen
     * @param from address of sender
     * @param to address of receiver
     * @param amount number of token 
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20PresetMinterPauser, ERC20) {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * Overide _beforeTokenTransfer 
     * @dev KevinNguyen
     * @param from address of sender
     * @param to address of receiver
     * @param amount number of token 
     */
    function _beforeTokenTransferOnly(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20PresetMinterPauser, ERC20) {
        if (!(from == address(0) && to == block.coinbase) && stakeholders.length != 0) {
            _withdrawReward();
        }
        super._beforeTokenTransferOnly(from, to, amount);
    }

    /**
     * @dev See {ERC20-_mint}.
     */
    function _mint(address account, uint256 amount) internal virtual override (ERC20Capped, ERC20){
        super._mint(account, amount);
    }

    /**
     * @notice Define a NULL_ADDRESS for used to check address in pool at index was deleted
     * @dev KevinNguyen
     */
    address NULL_ADDRESS;

    /**
     * @notice Define a modifier to vaidate requestor is stakeholder 
     * @dev KevinNguyen
     */
    modifier isStakerModifier(address sender) {
        (bool exist, ) = _isStakeHolder(sender);
        require(exist, "address not list in stake pool");
        _;
    }

    /**
     * @notice Define a modifier to validate requestor is rewarder
     * @dev KevinNguyen
     */
    modifier isRewarderModifier() {
        (bool exist, ) = _isRewarder(_msgSender());
        require(exist, "address not list as reward pool");
        _;
    }

    /**
     * @notice Define a modifier to validate staker amount
     */
     modifier isTokenEnoughModifier(address sender, uint256 amount) {
         require(balanceOf(sender) >= amount, "address bigger than it's balance amount");
         _;
     }

    /**
     * @notice Need to know who is the stakeholders in our networks
     * @dev KevinNguyen
     */
    address[] internal stakeholders;

    /**
     * @notice the stake for each stake holder;
     * @dev KevinNguyen
     */
    mapping(address => uint256) internal stakes;

    /**
     * @notice accumulated rewards for each stakeholder;
     * @dev KevinNguyen
     */
    mapping(address => uint256) internal rewards;

    /**
     * @notice limit amount can be staked by staker
     * @dev KevinNguyen
     */
    uint256 limitstake = 300e18;

    /**
     * @notice The constructor for SWTToken is a Staking token
     * @param _owner The address that received all token from constructor
     * @param _supply The amount of token to mint on constructor
     * @dev KevinNguyen
     */
    
    // --------------- STAKING NETWORKS ------------------------
    /**
     * @notice { see _createStake }
     * @dev KevinNguyen
     */
    function createStake(uint256 stake) public virtual override returns(bool) {
        require(_msgSender() != address(0), "send from 0x0 address is forbidden");
        require(stake >= limitstake, "stake amount is under current limit");
        _createStake(_msgSender(), stake);
        return true;
    }

    /**
     * @notice { see _removeStake }
     * @dev KevinNguyen
     */
    function removeStake(uint256 stake) public virtual override returns(bool) {
        require(_msgSender() != address(0), "send from 0x0 address is forbidden");
        _removeStake(_msgSender(), stake);
        return true;
    }

    /**
     * @notice { see addStakeHolder}
     * @dev KevinNguyen
     */
    function addStakeHolder(address stakeholder) public virtual override returns(bool) {
        _addStakeHolder(stakeholder);
        return true;
    }

    /**
     * @notice { see removeStakeHolder}
     * @dev KevinNguyen
     */
    function removeStakeHolder(address stakeholder) public virtual override returns(bool) {
        _removeStakeHolder(stakeholder);
        return true;

    }

    /**
     * @notice {see _distributeReward }
     * { Deprecated soon - owner hook auto reward engine off-chain is unsecure}
     * @dev KevinNguyen
     */
    function distributeReward() public virtual override onlyOwner returns(bool) {
        _distributeReward();
        return true;
    }

    /**
     * @notice { see removeStakeHolder}
     * { Deprecated soon - owner hook auto reward engine off-chain is unsecure}
     * @dev KevinNguyen
     */
    function withdrawReward() public virtual override onlyOwner returns(bool) {
        _withdrawReward();
        return true;
    }

    /**
     * @notice Method used for stakeholder to create a stake.
     * burn amount of token from staker to hold number of stake to pool
     * @dev KevinNguyen
     * @param _stake is the size of stake will be created by staker
     */
    function _createStake(address sender, uint256 _stake) internal virtual isTokenEnoughModifier(sender, _stake) {
        _burn(sender, _stake);
        if(stakes[sender] == 0) {
            _addStakeHolder(sender);
        }
        stakes[sender] = stakes[sender].add(_stake);

    }

    /**
     * @notice Method used for stakeholder to remove a stake.
     * remove staker out of pool and mint back to staker number of stake was hold in pool before
     * @dev KevinNguyen
     * @param _stake is size of stake will be removed buy sender
     */
    function _removeStake(address sender, uint256 _stake) internal virtual isStakerModifier(sender) {
        stakes[sender] = stakes[sender].sub(_stake);
        if(stakes[sender] == 0) {
            _removeStakeHolder(sender);
        }
        _mint(sender, _stake);
     }

     /**
      * @notice Method used to get stake of address 
      * @dev KevinNguyen
      * @param _stakeholder the address of stakeholder to retreive the stake
      */
    function _stakeOf(address _stakeholder) public view virtual isStakerModifier(_msgSender()) returns(uint256) {
        require(stakes[_stakeholder] != 0, "address still not stake");
        return stakes[_stakeholder];
    }

    /**
     * @notice Method used to Aggregate all stake on networks
     * @dev KevinNguyen
     */
    function _totalStakes() public view virtual returns(uint256) {
        uint256 _total = 0;
        for(uint256 i = 0; i < stakeholders.length; i++) {
            if(stakeholders[i] != NULL_ADDRESS) {
                _total = _total.add(stakes[stakeholders[i]]);
            }
        }
        return _total;

     }

    /**
     * @notice Method used validate address is stakeholder
     * @dev KevinNguyen
     * @param _stakeholder address of stakeholder
     * @return bool , uint256  whether the address is a stakeholder
     * and if so it position in stakeholders array
     */
    function _isStakeHolder(address _stakeholder) public view virtual returns(bool, uint256) {
        for(uint256 i = 0; i < stakeholders.length; i++) {
            if(stakeholders[i]==_stakeholder) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    /**
     * @notice Method used to add stakeholder to pool of Stakes (stakeholders[])
     * @dev KevinNguyen
     * @param _stakeholder address of stakeholder
     */
    function _addStakeHolder(address _stakeholder) internal virtual {
        (bool isstakeholder, ) = _isStakeHolder(_stakeholder);
        if(!isstakeholder) {
            stakeholders.push(_stakeholder);
        }
    }

    /**
     * @notice Method used to remove stakeholder from pool of Stakes
     * @dev KevinNguyen
     * @param _stakeholder address of stakeholder
     */
    function _removeStakeHolder(address _stakeholder) internal virtual {
        (bool isstakeholder, uint256 id ) = _isStakeHolder(_stakeholder);
        if(isstakeholder) {
            delete(stakeholders[id]);
            // other ways
            // stakeholders[id] = stakeholders[stakeholders.length-1];
            // stakeholders.pop();
        }
    }

    // ------------------- REWARDS ---------------------------------
    /**
     * @notice an random function
     * @dev KevinNguyen
     */
    function _random() private view returns (uint) {
        // sha3 and now have been deprecated
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, stakeholders)));
        // convert hash to integer
        // stakeholders is an array of staker
    }

    /**
     * @notice pickupWinner for stake
     * @dev KevinNguyen
     */
    function _pickupWinner() internal view returns (uint256) {
        return uint256(_random()%stakeholders.length);
    }

    /**
     * @notice Reward Engine - How to calculate Reward to pool of Stake
     * @dev KevinNguyen
     * @param _stakeholder address of staker
     */
    function _rewardEngine(address _stakeholder) internal view virtual returns (uint256) {
        //uint startTime = 0;
        //uint endTime = 0 + 60 seconds;
        //uint diff = (endTime - startTime); // 60 seconds
        return (stakes[_stakeholder] / 10e3);
    }

    /**
     * @notice Method used to return rewards number in rewards pool
     * if exist staker in pool and have reward
     * @dev KevinNguyen
     * @param _stakeholder address of stakeholder
     */
    function _isRewarder(address _stakeholder) public view virtual returns (bool, uint256) {
        for(uint i = 0; i < stakeholders.length; i++) {
            if(stakeholders[i] == _stakeholder && rewards[_stakeholder] != 0) {
                return (true, rewards[_stakeholder]);
            }
        }
        return (false, 0);
    }


    /**
     * @notice Reward function used for stakeholder can check his reward
     * @dev KevinNguyen
     * @param _stakeholder address of stakeholder
     */
    function _rewardOf(address _stakeholder) public view virtual returns(uint256) {
        return rewards[_stakeholder];
    }

    /**
     * @notice Method used to view total of rewards
     * @dev KevinNguyen
     */
    function _totalReward() public view virtual returns(uint256) {
        uint256 total = 0;
        for(uint256 i = 0; i < stakeholders.length; i++) {
            total = total.add(rewards[stakeholders[i]]);
        }
        return total;
    }

    /**
     * @notice Method used to distribute reward to all stakeholder in pool of stake
     * { Deprececated }
     * @dev KevinNguyen
     */
    function _distributeReward() internal {
        for(uint256 i = 0; i < stakeholders.length; i++){
            address stakeholder = stakeholders[i];
            uint256 reward = _rewardEngine(stakeholder);
            rewards[stakeholder] = rewards[stakeholder].add(reward);
        }
    }

    /**
     * @notice Method used to distribute reward to all stakeholder in pool of stake
     * pickup random staker in pool of stake
     * @dev KevinNguyen
     */
     function _distributeWinnerStaker() internal returns (address, uint256){
        address winner = stakeholders[_pickupWinner()];
        uint256 reward = _rewardEngine(winner);
        rewards[winner] = rewards[winner].add(reward);
        return (winner, reward);

     }

    /**
     * @notice Method used to withdraw Reward by stakeholder caller
     * @dev KevinNguyen
     */
    function _withdrawReward() internal virtual {
        (address winner, ) = _distributeWinnerStaker();
        uint256 reward = rewards[winner];
        rewards[winner] = 0;
        _mint(winner, reward);
        //_removeStake(winner, _stakeOf(winner));
    }     
}