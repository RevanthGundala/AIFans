// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {AIFansFactory} from "../src/AIFansFactory.sol";
import {FanMedia} from "../src/FanMedia.sol";

contract DeployFanMedia is Script {
    function run() external returns (address nft) {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        FanMedia fanMedia = new FanMedia{salt: "iuasfdosdfaiafdajs"}("mFAN, mFAN");
        nft = address(fanMedia);
        vm.stopBroadcast();
    }
}
