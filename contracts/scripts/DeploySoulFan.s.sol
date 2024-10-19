// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {AIFansFactory} from "../src/AIFansFactory.sol";
import {SoulFan} from "../src/SoulFan.sol";

contract DeploySoulFan is Script {
    function run() external returns (address nft) {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        SoulFan soulFan = new SoulFan{salt: "iuasfdosdfaiafdajs"}("sFAN", "sFAN");
        nft = address(soulFan);
        vm.stopBroadcast();
    }
}
