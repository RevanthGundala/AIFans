import { CommandGroup } from "@xmtp/message-kit";
import { tip, generateImage } from "./handlers.js";

export const commands: CommandGroup[] = [
  {
    name: "Tip",
    description: "Send a specified amount of a cryptocurrency.",
    triggers: ["/tip"],
    commands: [
      {
        command: "/tip [amount] [token] [network]",
        description: "Send a specified amount of a cryptocurrency.",
        handler: tip,
        params: {
          amount: {
            default: 10,
            type: "number",
          },
          token: {
            default: "eth",
            type: "string",
            values: ["eth"],
          },
          network: {
            default: "sepolia",
            type: "string",
            values: ["sepolia, polygon"], // TODO: add all chains
          },
        },
      },
    ],
  },
  {
    name: "Image",
    description: "Generate an AI image based on the text prompt.",
    triggers: ["/image"],
    commands: [
      {
        command: "/image [prompt]",
        description: "Generate an AI image based on the text prompt.",
        handler: generateImage,
        params: {
          prompt: {
            type: "string",
          },
        },
      },
    ],
  },
];
