import { HandlerContext } from "@xmtp/message-kit";
import { XMTPMessage, Content, CommandContent } from "./types";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export const transaction = async () => {};

export const generateImage = async (params: any) => {};

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
