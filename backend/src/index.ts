import express from "express";
import type { Express, Request, Response } from "express";
import { HandlerContext, run } from "@xmtp/message-kit";
import { privateKeyToAccount, PrivateKeyAccount } from "viem/accounts";
import { commands } from "./commands";
import {
  ClientInfo,
  XMTPMessage,
  Content,
  CommandContent,
  CleanupParams,
} from "./types";
import { generateImage, generateText } from "./handlers.js";
import { TappdClient } from "@phala/dstack-sdk";
import { keccak256 } from "viem";

const app: Express = express();
app.use(express.json());
const port: number = 3000;

const endpoint =
  process.env.DSTACK_SIMULATOR_ENDPOINT || "http://localhost:8090";

const client = new TappdClient(endpoint);

// Store active XMTP clients
const activeClients: Map<string, ClientInfo> = new Map();

async function getPrivateKey(tokenId: string): Promise<string> {
  const randomDeriveKey = await client.deriveKey(tokenId, process.env.SALT!);
  const privateKey = keccak256(randomDeriveKey.asUint8Array());
  return privateKey;
}

// Initialize XMTP message handler with specific private key
async function initializeXMTPClient(privateKey: string): Promise<ClientInfo> {
  let isActive: boolean = true;

  // Create a cleanup function before running the client
  const cleanup = async (): Promise<void> => {
    isActive = false;
    return Promise.resolve();
  };

  // Start the XMTP client with the active flag check
  run(
    async (context: HandlerContext) => {
      console.log("Running...");
      // Only process messages if the client is still active
      if (!isActive) return;

      const message = context.message as unknown as XMTPMessage;
      console.log("Full message context:", JSON.stringify(message, null, 2));

      const { content, typeId } = message;

      if (typeId === "text") {
        // Check if content is a command format
        if ("command" in content) {
          // Handle as command
          console.log("command");
          const { command, params } = content as CommandContent;
          if (command === "image") {
            await generateImage(context);
          } else if (command === "voice") {
          }
        } else {
          // Handle as regular text
          await generateText(context);
        }
      }
    },
    {
      privateKey: privateKey,
    }
  );
  // TODO: ask how to pass in tokenId as parameter

  // Get the address from the private key
  const account: PrivateKeyAccount = privateKeyToAccount(
    privateKey as `0x${string}`
  );

  return {
    cleanup,
    address: account.address,
  };
}

app.get("/", (_req: Request, res: Response): void => {
  res.send("Express + TypeScript Server");
});

app.get(
  "/address/:tokenId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tokenId } = req.params;
      const privateKey = await getPrivateKey(tokenId);
      const account = privateKeyToAccount(privateKey as `0x${string}`);

      res.json({
        status: "success",
        address: account.address,
      });
    } catch (error) {
      console.error("Failed to calculate address:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// REST endpoints
app.post(
  "/xmtp/initialize",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tokenId } = req.body;

      if (!tokenId) {
        res.status(400).json({ error: "Token ID is required" });
        return;
      }

      const privateKey = await getPrivateKey(tokenId);

      if (!privateKey) {
        res.status(400).json({ error: "Private key is required" });
        return;
      }

      if (activeClients.has(privateKey)) {
        res.status(409).json({
          error: "Client already exists",
          address: activeClients.get(privateKey)?.address,
        });
        return;
      }

      const clientInfo: ClientInfo = await initializeXMTPClient(privateKey);
      activeClients.set(privateKey, clientInfo);

      res.json({
        status: "success",
        message: "XMTP client initialized",
        address: clientInfo.address,
      });
    } catch (error) {
      console.error("Failed to initialize XMTP client:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

app.delete(
  "/xmtp/cleanup/:address",
  async (req: Request<CleanupParams>, res: Response): Promise<void> => {
    try {
      const { address } = req.params;

      for (const [privateKey, clientInfo] of activeClients.entries()) {
        if (clientInfo.address.toLowerCase() === address.toLowerCase()) {
          await clientInfo.cleanup();
          activeClients.delete(privateKey);
          res.json({
            status: "success",
            message: "XMTP client cleaned up",
          });
          return;
        }
      }

      res
        .status(404)
        .json({ error: "No active client found for this address" });
    } catch (error) {
      console.error("Failed to cleanup XMTP client:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

app.get("/xmtp/active-clients", (_req: Request, res: Response): void => {
  const clients = Array.from(activeClients.entries()).map(
    ([_, clientInfo]: [string, ClientInfo]) => ({
      address: clientInfo.address,
    })
  );

  res.json({ activeClients: clients });
});

process.on("SIGINT", async () => {
  console.log("Cleaning up XMTP clients...");
  for (const [privateKey, clientInfo] of activeClients.entries()) {
    try {
      await clientInfo.cleanup();
      activeClients.delete(privateKey);
    } catch (error) {
      console.error(
        `Failed to cleanup client for ${clientInfo.address}:`,
        error
      );
    }
  }
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default app;
