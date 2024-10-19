import { CommandGroup } from "@xmtp/message-kit";

const transaction = async (params: any) => {};
const generateImage = async (params: any) => {};

export const commands: CommandGroup[] = [
  {
    name: "Tip",
    description: "Send a specified amount of a cryptocurrency.",
    triggers: ["/tip"],
    commands: [
      {
        command: "/tip [amount] [token]",
        description: "Send a specified amount of a cryptocurrency.",
        handler: transaction,
        params: {
          amount: {
            default: 10,
            type: "number",
          },
          token: {
            default: "usdc",
            type: "string",
            values: ["usdc", "eth"],
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
