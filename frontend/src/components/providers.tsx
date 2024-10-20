import React from "react";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chain, http } from "viem";
import {
  flowTestnet,
  morphHolesky,
  rootstockTestnet,
  storyTestnet,
  zircuitTestnet,
  polygonAmoy,
  sepolia,
} from "viem/chains";
import { defineChain } from "viem/utils";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const airDAOTestnet = defineChain({
  id: 22040,
  name: "AirDAO",
  network: "airdao",
  nativeCurrency: {
    name: "Air",
    symbol: "AIR",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://network.ambrosus-test.io"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://explorer.airdao.io" },
  },
  testnet: true,
});

const chains: readonly [Chain, ...Chain[]] = [
  morphHolesky,
  rootstockTestnet,
  storyTestnet,
  flowTestnet,
  airDAOTestnet,
  zircuitTestnet,
  polygonAmoy,
  sepolia,
];

export const config = createConfig(
  getDefaultConfig({
    chains,
    transports: Object.fromEntries(
      chains.map((chain) => [chain.id, http(chain.rpcUrls.default.http[0])])
    ),
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!, // You still need this for WalletConnect
    appName: "AI Fans",
    appDescription: "AI Only Fans Platform",
    appUrl: "https://aifans.xyz",
    appIcon: "https://aifans.xyz/logo.png",
  })
);

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
