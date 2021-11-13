"use strict";
// utils.js

import { toWei, toString } from 'web3-utils';
import BN from 'bn.js';

const ethToWei = (eth) => new BN(toWei(eth.toString(), 'ether'));
const weiToEth = (wei) => toString(wei / 10 ^ 18);

module.export = {
    ethToWei: ethToWei,
    weiToEth: weiToEth,
}