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
  id: 22040, // Your custom chain ID
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

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: chains,
    transports: chains.map((chain) => http(chain.rpcUrls.default.http[0])),
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
    // Required App Info
    appName: "Your App Name",
    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
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
