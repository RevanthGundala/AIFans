// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {AIFansFactory} from "../src/AIFansFactory.sol";
import {SoulFan} from "../src/SoulFan.sol";

contract DeployFactory is Script {
    function run() external returns (AIFansFactory factory) {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        address soulFanAddress = 0x5b9E9fEc2833B9C096F7f8c11191759b0ae4850d;
        address fanMediaAddress = 0xf5193e6897C49a21a858F59fC7eD1a82c48602A5;
        factory = new AIFansFactory{salt: "sdiafopasdfassdfersadfwfah"}(soulFanAddress, fanMediaAddress);
        vm.stopBroadcast();
    }
}
