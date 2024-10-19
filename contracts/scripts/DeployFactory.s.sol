// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {AIFansFactory} from "../src/AIFansFactory.sol";
import {SoulFan} from "../src/SoulFan.sol";

contract DeployFactory is Script {
    function run() external returns (AIFansFactory factory) {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        address soulFanAddress = 0x0;
        address fanMediaAddress = 0x0;
        factory = new AIFansFactory{salt: "sdiafopasdfassdfersadfwfah"}(soulFanAddress, fanMediaAddress);
        vm.stopBroadcast();
    }
}
