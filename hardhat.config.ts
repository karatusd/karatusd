import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "./tasks"

const deployerPrivateKey = process.env.DEPLOYER;
const accounts = deployerPrivateKey ? [deployerPrivateKey] : []

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    polygon: {
      chainId: 137,
      url: vars.get("POLYGON_RPC"),
      accounts
    },
    ethereum: {
      chainId: 1,
      url: vars.get("ETHEREUM_RPC"),
      accounts
    },
    optimisticEthereum: {
      chainId: 10,
      url: vars.get("OP_RPC"),
      accounts
    },
    arbitrumOne: {
      chainId: 42161,
      url: vars.get("ARBITRUM_RPC"),
      accounts
    },
    avalanche: {
      chainId: 43114,
      url: vars.get("AVALANCHE_RPC"),
      accounts
    },
    base: {
      chainId: 8453,
      url: vars.get("BASE_RPC"),
      accounts
    },
    mainnet: {
      chainId: 1,
      url: vars.get("ETHEREUM_RPC"),
      accounts
    }
  },
  etherscan: {
    apiKey: {
      arbitrumOne: vars.get("ARBISCAN_API_KEY", ""),
      optimisticEthereum: vars.get("OPTIMISTIC_ETHERSCAN_API_KEY", ""),
      base: vars.get("BASESCAN_API_KEY", ""),
      polygon: vars.get("POLYGONSCAN_API_KEY", ""),
      mainnet: vars.get("ETHERSCAN_API_KEY", ""),
      avalanche: vars.get("SNOWTRACE_API_KEY", "")
    },
  }
};

export default config;
