"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ABI, ADDRESS } from "@/lib/constants";
import { useReadContract } from "wagmi";
import { ConnectKitButton } from "connectkit";

export default function Home() {
  const { data: bots, isLoading } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "getBots",
  });
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async () => {
    console.log("Getting image");
    try {
      // Get Image from Replicate
      const blobId = await getImage(prompt);
      // Submit tx
      // const chainId = await client?.getChainId();
      const response = await fetch(`${AGGREGATOR}/v1/${blobId}`);
      const blob = await response.blob();
      // Create a URL from the Blob and set it as the image source
      const objectUrl = URL.createObjectURL(blob);
      // Update state to trigger re-render with the new image
      const url = await publishNftAsWalrusSite(blobId);
      console.log("Url: ", url);
      console.log("Submitting tx...");

      const tx = await client?.writeContract({
        abi: ABI,
        address: ADDRESS,
        functionName: "createBot",
        args: [
          "Alice",
          "ALICE",
          objectUrl,
          "0x0000000000000000000000000000000000000000000000000000000000012345", // example secret
        ],
      });
      console.log(tx);
      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error writing contract:", error);
      // Optionally handle errors here
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
            {/* <CardContent className="p-0 relative">
              <img
                src={bot.image}
                alt={bot.name}
                className="w-full h-64 object-cover"
              />
              <div
                className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                  bot.isOnline ? "bg-green-500" : "bg-red-500"
                }`}
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
            </CardFooter> */}
          </Card>
        ))}
      </div>
    </div>
  );
}
