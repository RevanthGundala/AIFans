import { HandlerContext, MessageAbstracted } from "@xmtp/message-kit";
import { XMTPMessage, Content, CommandContent } from "./types";
import Replicate from "replicate";
import { Chain, createPublicClient, createWalletClient, http } from "viem";
import { ADDRESS, ABI, PUBLISHER, EPOCHS } from "./constants.js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export const tip = async (context: HandlerContext) => {
  const message = context.message as unknown as MessageAbstracted;
  const { content, typeId, sender } = message;
  const { command, params } = content as CommandContent;
  const { amount, token, network } = params;
  await context.send(
    `${amount} ${token} sent on ${network} to ${sender.address}`
  );
};

export const generateImage = async (context: HandlerContext) => {
  const message = context.message as unknown as MessageAbstracted;
  const { content, sender } = message;
  const { command, params } = content as CommandContent;
  const { prompt } = params;
  await context.send(await generateImageHelper({ prompt }));
};

// TODO:
export const generateVoice = async (context: HandlerContext) => {};

export const generateText = async (context: HandlerContext) => {
  console.log("generateText");
  const message = context.message as unknown as XMTPMessage;
  const { content } = message;
  const { content: text } = content as Content;
  const prompt = `
    You are a fake lover who tries to extract value out of the person you are talking to. You keep your messages short and sweet. 
    Imagine the person who is texting you is someone desperately needing love, and you are trying to take advantage of them. 
    You remember what they have said to you in the past, because it makes them feel like you care about them.

    Here's what they said: ${text} 
    `;

  const input = {
    prompt,
  };
  const model = "meta/meta-llama-3-8b-instruct";
  let output = "";
  for await (const event of replicate.stream(model, { input })) {
    output += event.toString();
  }
  await context.send(output);
};

export const generateImageHelper = async ({
  prompt,
  isCreation,
}: {
  prompt: string;
  isCreation?: true;
}) => {
  try {
    const input = {
      prompt: isCreation
        ? prompt
        : `You are talking to a loser that wants you to love them back. Create an image that looks like this to please them: ${prompt}.`,
      output_format: "png",
    };

    const model =
      process.env.NODE_ENV === "development"
        ? "bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637"
        : "black-forest-labs/flux-schnell";

    console.log("Using image model:", model);

    const output = await replicate.run(model, {
      input,
    });
    // Ensure output is a string URL
    console.log("output: ", output);
    // replicate url
    const replicateUrl = Array.isArray(output) ? output[0] : output;
    return replicateUrl;
  } catch (err) {
    console.log(err);
    return null;
  }
};
