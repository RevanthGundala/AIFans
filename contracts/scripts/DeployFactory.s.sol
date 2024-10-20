// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {AIFansFactory} from "../src/AIFansFactory.sol";
import {FanMedia} from "../src/FanMedia.sol";
import {SoulFan} from "../src/SoulFan.sol";

contract DeployFactory is Script {
    function run() external returns (AIFansFactory factory) {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        FanMedia fanMedia = new FanMedia("mFAN", "mFAN");
        SoulFan soulFan = new SoulFan("sFAN", "sFAN");
        factory = new AIFansFactory(address(soulFan), address(fanMedia));
        vm.stopBroadcast();
    }
}
