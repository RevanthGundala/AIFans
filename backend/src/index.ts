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
import { AGGREGATOR } from "./constants.js";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";
import path from "path";
import cors from "cors";

const app: Express = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
const port: number = 3000;

const endpoint =
  process.env.DSTACK_SIMULATOR_ENDPOINT || "http://localhost:8090";

const client = new TappdClient(endpoint);

// Store active XMTP clients
const activeClients: Map<string, ClientInfo> = new Map();

async function getPrivateKey(tokenId: string): Promise<string> {
  // TODO:
  // const randomDeriveKey = await client.deriveKey(tokenId, process.env.SALT!);
  // const privateKey = keccak256(randomDeriveKey.asUint8Array());
  return "0x3654025b90169617331c6b8d8a61b1268a592689626b3f511ffcaf43871e09b6";
  // return privateKey;
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
  try {
    const { prompt, tokenId } = req.body;
    const blobId = await generateImageHelper(prompt);
    console.log("Blob ID:", blobId);
    const privateKey = await getPrivateKey(tokenId);
    const { address } = privateKeyToAccount(privateKey as `0x${string}`);
    console.log("Address:", address);
    const response = await fetch(`${AGGREGATOR}/v1/${blobId}`);
    const rawResponse = await response.arrayBuffer();
    res.json({
      status: "success",
      blobId,
      wallet: address,
      rawResponse: Buffer.from(rawResponse).toString("base64"),
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
    });
  }
});

app.post(
  "/publish-site",
  async (req: Request, res: Response): Promise<void> => {
    const { blobId, botWallet, tokenId } = req.body;
    const execPromise = util.promisify(exec);

    const INLINE_SCRIPT = `
      #!/bin/bash
      set -e
      SITE_CONTENT_PATH=$1
      BLOB_ID=$2
      cd ../walrus-sites
      echo "Current directory: $(pwd)"
      echo "Contents of current directory:"
      ls -la
      echo "Executing site-builder..."
      OUTPUT=$(./target/release/site-builder publish "$SITE_CONTENT_PATH" --epochs 100)
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
    <title>AI Fan Profile</title>
    <style>
      body {
        margin: 0;
        padding: 20px;
        min-height: 100vh;
        background-color: #f0f0f0;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        display: flex;
        gap: 40px;
        align-items: flex-start;
      }
      .image-container {
        flex: 1;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .info-container {
        flex: 1;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
      .button {
        display: inline-flex;
        align-items: center;
        padding: 10px 20px;
        background-color: white;
        border: 1px solid #60a5fa;
        color: #60a5fa;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        text-decoration: none;
        margin-right: 10px;
        transition: all 0.2s ease;
      }
      .button:hover {
        background-color: #f0f7ff;
      }
      .arrow-icon {
        margin-left: 8px;
        width: 16px;
        height: 16px;
      }
      #loadingMessage, #errorMessage {
        font-size: 16px;
        color: #374151;
        margin: 20px 0;
      }
      #retryButton {
        padding: 10px 20px;
        background-color: #60a5fa;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: none;
      }
      .wallet-address {
        font-family: monospace;
        background: #f3f4f6;
        padding: 8px 12px;
        border-radius: 6px;
        margin: 10px 0;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="image-container">
        <p id="loadingMessage">Loading image...</p>
        <p id="errorMessage" style="display:none;"></p>
        <button id="retryButton">Retry</button>
      </div>
      <div class="info-container">
        <h2>AI Fan Profile</h2>
        <div class="wallet-address">${botWallet}</div>
        <div style="margin-top: 20px">
          <a href="#" onclick="initializeChat()" class="button">
            Chat
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7M17 7H7M17 7V17"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <script>
      const BLOB_ID = "${blobId}";
      const AGGREGATOR = "${AGGREGATOR}";
      const BOT_WALLET = "${botWallet}";
      const TOKEN_ID = "${tokenId}";

      async function initializeChat() {
        try {
          const response = await fetch('${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/xmtp/initialize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tokenId: TOKEN_ID
            })
          });

          const data = await response.json();
          if (data.status === 'success') {
            // Open XMTP chat in new tab (replace with your chat URL)
            window.open(\`https://xmtp.chat/dm/\${BOT_WALLET}\`, '_blank', 'noopener,noreferrer');
          } else {
            console.error('Failed to initialize chat:', data.error);
          }
        } catch (error) {
          console.error('Error initializing chat:', error);
        }
      }

      async function fetchAndRenderImage() {
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessage = document.getElementById('errorMessage');
        const retryButton = document.getElementById('retryButton');
        const imageContainer = document.querySelector('.image-container');

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

      const urlMatch = stdout.match(/WALRUS_URL:(.*\.walrus\.site)/);
      const publishedUrl = urlMatch ? urlMatch[1] : null;

      if (publishedUrl) {
        console.log("Published URL:", publishedUrl);
        res.status(200).json({ url: publishedUrl });
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
