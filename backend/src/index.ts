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
import {
  generateImage,
  generateImageHelper,
  generateText,
  tip,
} from "./handlers.js";
import { TappdClient } from "@phala/dstack-sdk";
import { keccak256 } from "viem";
import { EPOCHS, PUBLISHER, AGGREGATOR } from "./constants";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";
import path from "path";

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
          } else if (command === "tip") {
            await tip(context);
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

app.post("/create-bot", async (req: Request, res: Response): Promise<void> => {
  const { prompt, tokenId } = req.body;
  const blobId = await generateImageHelper(prompt);
  const privateKey = await getPrivateKey(tokenId);
  const { address } = privateKeyToAccount(privateKey as `0x${string}`);

  res.json({
    status: "success",
    blobId: blobId,
    wallet: address,
  });
});

app.post(
  "/publish-site",
  async (req: Request, res: Response): Promise<void> => {
    const { blobId } = req.body;
    const execPromise = util.promisify(exec);

    const INLINE_SCRIPT = `
      #!/bin/bash
      set -e
      SITE_CONTENT_PATH=$1
      BLOB_ID=$2
      cd walrus-sites
      echo "Current directory: $(pwd)"
      echo "Contents of current directory:"
      ls -la
      echo "Executing site-builder..."
      OUTPUT=$(./target/release/site-builder --gas-budget 500000000 publish "$SITE_CONTENT_PATH")
      echo "Raw output from site-builder:"
      echo "$OUTPUT"
      URL=$(echo "$OUTPUT" | grep -o 'https://.*\\.walrus\\.site')
      echo "WALRUS_URL:$URL"
    `;

    try {
      console.log("Starting Walrus site creation...");
      console.log("Blob ID:", blobId);

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Constant Blob Image Viewer</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f0f0f0;
                font-family: Arial, sans-serif;
              }
              #imageContainer {
                max-width: 100%;
                max-height: 100vh;
                text-align: center;
              }
              #loadingMessage, #errorMessage {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
              }
              #retryButton {
                padding: 10px 20px;
                font-size: 16px;
                background-color: #4CAF50;
                color: white;
                border: none;
                cursor: pointer;
                display: none;
              }
              #retryButton:hover {
                background-color: #45a049;
              }
            </style>
          </head>
          <body>
            <div id="imageContainer">
              <p id="loadingMessage">Loading image...</p>
              <p id="errorMessage" style="display:none;"></p>
              <button id="retryButton">Retry</button>
            </div>
            <script>
              const BLOB_ID = "${blobId}";
              const AGGREGATOR = "${AGGREGATOR}";
  
              async function fetchAndRenderImage() {
                const loadingMessage = document.getElementById('loadingMessage');
                const errorMessage = document.getElementById('errorMessage');
                const retryButton = document.getElementById('retryButton');
                const imageContainer = document.getElementById('imageContainer');
  
                loadingMessage.style.display = 'block';
                errorMessage.style.display = 'none';
                retryButton.style.display = 'none';
  
                try {
                  const response = await fetch(\`\${AGGREGATOR}/v1/\${BLOB_ID}\`);
                  if (!response.ok) {
                    throw new Error('Failed to fetch image');
                  }
                  const blob = await response.blob();
                  const objectUrl = URL.createObjectURL(blob);
  
                  const img = new Image();
                  img.onload = function() {
                    loadingMessage.style.display = 'none';
                    imageContainer.appendChild(img);
                  };
                  img.onerror = function() {
                    throw new Error('Failed to load the image');
                  };
                  img.src = objectUrl;
                  img.style.maxWidth = '100%';
                  img.style.height = 'auto';
                } catch (error) {
                  loadingMessage.style.display = 'none';
                  errorMessage.textContent = 'Error: ' + error.message;
                  errorMessage.style.display = 'block';
                  retryButton.style.display = 'inline-block';
                }
              }
  
              document.getElementById('retryButton').addEventListener('click', fetchAndRenderImage);
              fetchAndRenderImage();
            </script>
          </body>
        </html>
      `;

      const tempDir = path.join(process.cwd(), "temp-site");
      await fs.mkdir(tempDir, { recursive: true });
      await fs.writeFile(path.join(tempDir, "index.html"), htmlContent);
      console.log("Temporary directory created:", tempDir);

      const scriptPath = path.join(process.cwd(), "temp-publish-script.sh");
      await fs.writeFile(scriptPath, INLINE_SCRIPT);
      await fs.chmod(scriptPath, "755");
      console.log("Temporary script created:", scriptPath);

      console.log("Executing script...");
      const { stdout, stderr } = await execPromise(
        `sh ${scriptPath} ${tempDir} ${blobId}`
      );

      console.log("Script execution complete.");
      console.log("stdout:", stdout);

      if (stderr) {
        console.error("stderr from publish script:", stderr);
      }

      await fs.unlink(scriptPath);
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log("Temporary files cleaned up.");

      const urlMatch = stdout.match(/WALRUS_URL:(https:\/\/.*\.walrus\.site)/);
      const publishedUrl = urlMatch ? urlMatch[1] : null;

      if (publishedUrl) {
        console.log("Published URL:", publishedUrl);
        res.status(200).json({ publishedUrl });
      } else {
        console.error("Invalid URL returned from script");
        console.error("Full stdout:", stdout);
        throw new Error("Invalid URL returned from script");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({});
    }
  }
);

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
