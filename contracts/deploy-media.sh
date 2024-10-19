source .env

forge script scripts/DeployFanMedia.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --verifier blockscout --verifier-url https://eth-sepolia.blockscout.com/api/
forge script scripts/DeploySoulFan.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --verifier blockscout --verifier-url https://eth-sepolia.blockscout.com/api/