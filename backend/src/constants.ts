export const ADDRESS = "0xb97797AdB692DCCb0907d90CeFe215638D76DAFC";
export const ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_soulFanAddress", type: "address", internalType: "address" },
      { name: "_fanMediaAddress", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "bots",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "wallet", type: "address", internalType: "address" },
      { name: "walrusSite", type: "string", internalType: "string" },
      { name: "subscriptionPrice", type: "uint256", internalType: "uint256" },
      { name: "imagePrice", type: "uint256", internalType: "uint256" },
      { name: "voicePrice", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createBot",
    inputs: [
      { name: "blob", type: "string", internalType: "string" },
      { name: "walrusSite", type: "string", internalType: "string" },
      { name: "botWallet", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "fanMediaAddress",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBotWallet",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBots",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct AIFansFactory.Bot[]",
        components: [
          { name: "wallet", type: "address", internalType: "address" },
          { name: "walrusSite", type: "string", internalType: "string" },
          {
            name: "subscriptionPrice",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "imagePrice", type: "uint256", internalType: "uint256" },
          { name: "voicePrice", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNextTokenId",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSubscription",
    inputs: [
      { name: "user", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "requestMedia",
    inputs: [
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "blob", type: "string", internalType: "string" },
      { name: "isImage", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setPrices",
    inputs: [
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "_subscriptionPrice", type: "uint256", internalType: "uint256" },
      { name: "_imagePrice", type: "uint256", internalType: "uint256" },
      { name: "_voicePrice", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "soulFanAddress",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "subscribe",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "subscriptions",
    inputs: [
      { name: "user", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "isSubscribed", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "BotCreated",
    inputs: [
      {
        name: "wallet",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "timestamp",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;
export const PUBLISHER = "https://walrus-testnet-publisher.nodes.guru";
export const EPOCHS = 10;
export const AGGREGATOR = "https://walrus-testnet-aggregator.nodes.guru";
