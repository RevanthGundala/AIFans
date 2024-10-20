"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOwnedNFTs, useContract } from "@thirdweb-dev/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ABI, ADDRESS, AGGREGATOR, FAN_MEDIA, SOUL_FAN } from "@/lib/constants";
import { useChainId, useChains, useReadContract } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient } from "wagmi";

export default function Home() {
  const { data: bots, isLoading } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "getBots",
  });
  const { address } = useAccount();
  const { data: client } = useWalletClient({
    account: address,
  });

  const { data: tokenId } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "getNextTokenId",
  });

  const { contract: soulFan } = useContract(SOUL_FAN);
  const { contract: fanMedia } = useContract(FAN_MEDIA);
  const [wallets, setWallets] = useState<string[]>([]);
  const [selectedBot, setSelectedBot] = useState();

  const { data: soulboundNFTs } = useMultipleOwnedNFTs(soulFan, wallets);
  const { data: fanMediaNFTs } = useOwnedNFTs(
    fanMedia,
    selectedBot?.wallet || ""
  );

  console.log("soulboundNFTs", soulboundNFTs);

  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const temp: string[] = bots?.map((bot) => bot.wallet) || [];
    setWallets(temp);
  }, [bots]);

  function useMultipleOwnedNFTs(contract, addresses) {
    const [nfts, setNfts] = useState({});

    // Create multiple hooks for each address
    const nftHooks = addresses?.map((address) =>
      useOwnedNFTs(contract, address)
    );

    // Combine results when any hook updates
    useEffect(() => {
      if (!addresses || !nftHooks) return;

      const newNfts = {};
      addresses.forEach((address, i) => {
        newNfts[address] = nftHooks[i].data;
      });
      setNfts(newNfts);
    }, [addresses, nftHooks]);

    return { data: nfts };
  }

  const handleSubscribe = async (tokenId: bigint) => {
    try {
      const tx = await client?.writeContract({
        abi: ABI,
        address: ADDRESS,
        functionName: "subscribe",
        args: [tokenId],
      });
      console.log(tx);
    } catch (err) {
      console.log(err);
    }
  };
  const handleRequestMedia = async (tokenId: bigint, isImage: boolean) => {
    try {
      const response = await fetch("");
      const { blobId } = await response.json();
      const tx = await client?.writeContract({
        abi: ABI,
        address: ADDRESS,
        functionName: "requestMedia",
        args: [tokenId, blobId, isImage],
      });
      console.log(tx);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Generating image...");
      // Get Image from Replicate
      const res = await fetch(`${apiUrl}/create-bot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tokenId, prompt }),
      });
      const data = await res.json();
      console.log("data received:", data);
      const { blobId, wallet, rawResponse } = data;

      const blob = await fetch(`data:image/png;base64,${rawResponse}`).then(
        (r) => r.blob()
      );
      console.log("blob: ", blob);
      const objectUrl = URL.createObjectURL(blob);

      console.log("Publishing site..." + objectUrl);
      // Publish site
      const publishRes = await fetch(`${apiUrl}/publish-site`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blobId }),
      });
      const { url } = await publishRes.json();
      console.log("Url:", url);
      if (!url) throw new Error("Failed to publish");
      console.log("Submitting transaction...");
      const tx = await client?.writeContract({
        abi: ABI,
        address: ADDRESS,
        functionName: "createBot",
        args: [name, blobId, objectUrl, wallet],
      });
      console.log(tx);

      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error writing contract:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-blue-100 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-500">ConnectMe</h1>
        <ConnectKitButton />
      </header>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6 bg-blue-400 hover:bg-blue-500">
            Create bot
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Create New bot</DialogTitle>
            <DialogDescription>
              Fill in the details to create your new bot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              className="bg-blue-400 hover:bg-blue-500"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {bots?.map((bot, i) => (
          <Card key={i} className="overflow-hidden bg-white">
            <CardContent className="p-0 relative">
              <img
                src={bot.image}
                alt={bot.name}
                className="w-full h-64 object-cover"
              />
              <div
                className={`absolute top-2 right-2 w-3 h-3 rounded-full ${"bg-green-500"}`}
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-blue-500">
                {bot.name}
              </h2>
              <Button
                variant="outline"
                className="text-blue-400 border-blue-400 hover:bg-blue-100"
                onClick={() => console.log(`View bot of ${bot.name}`)}
              >
                View Profile
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
