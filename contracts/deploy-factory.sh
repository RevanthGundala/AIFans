source .env

forge script scripts/DeployFactory.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
forge script scripts/DeployFactory.s.sol --rpc-url $FLOW_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
forge script scripts/DeployFactory.s.sol --rpc-url $POLYGON_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
forge script scripts/DeployFactory.s.sol --rpc-url $AIRDAO_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
forge script scripts/DeployFactory.s.sol --rpc-url $MORPH_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
forge script scripts/DeployFactory.s.sol --rpc-url $ZIRCUIT_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY


