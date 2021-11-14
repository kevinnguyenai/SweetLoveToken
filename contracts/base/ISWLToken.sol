// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Interface of the SWL token 
 */
interface ISWLToken {
    /**
     * @notice 
     * @dev
     */
    function createStake(uint256 stake) external returns(bool);

    /**
     * @notice 
     * @dev
     */
    function removeStake(uint256 stake) external returns(bool);

     /**
     * @notice 
     * @dev
     */
    function addStakeHolder(address stakeholder) external returns(bool);

    /**
     * @notice 
     * @dev
     */
    function removeStakeHolder(address stakeholder) external returns(bool);

    /**
     * @notice
     * @dev
     */
    function distributeReward() external returns(bool);

    /**
     * @notice 
     * @dev
     */
    function withdrawReward() external returns(bool);
}