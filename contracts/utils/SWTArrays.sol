// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 *  @dev Extend Collection function relate to Arrays 
 */
library SWTArrays {
    /**
     * @dev Secure pop item out of an Arrays and rearrangement all of after item 
     */
    function requestorInList(uint256 index , address[] memory pool, address requestor) internal pure returns (bool) {
        require(index  < pool.length, "index out of pool");
        require(pool[index] == requestor, "item not exist");
        return true;
    }
}