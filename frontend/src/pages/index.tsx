"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Loader2, X, MessageSquare, Plus } from "lucide-react";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ABI, ADDRESS, AGGREGATOR } from "@/lib/constants";
import { useReadContract } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient } from "wagmi";
import { useRouter } from "next/router";
import { PopupAds } from "@/components/popup-ads";
import { parseEther } from "viem";

export default function Home() {
  const {
    data: bots,
    error: botsError,
    isLoading: botsLoading,
  } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "getBots",
  });

  const router = useRouter();
  const { address } = useAccount();

  const { data: client } = useWalletClient({
    account: address,
  });

  const { data: tokenId } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "getNextTokenId",
  });

  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBotUrl, setNewBotUrl] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const { data: isSubscribed } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: "subscriptions",
    args: [address as `0x${string}`, (selectedBot?.index + 1) as bigint | 0n],
  });

  console.log("isSubscribed:", isSubscribed);

  useEffect(() => {
    if (!bots?.length) return;
    console.log("bots:", bots);
    const fetchImages = async () => {
      try {
        const blobs = bots.flatMap((bot) => bot.blob);

        const urls = await Promise.all(
          blobs.map(async (blobId) => {
            try {
              const response = await fetch(`${AGGREGATOR}/v1/${blobId}`);

              if (!response.ok) {
                throw new Error(`Failed to fetch blob: ${blobId}`);
              }

              const blob = await response.blob();
              return URL.createObjectURL(blob);
            } catch (error) {
              console.error(`Error fetching blob ${blobId}:`, error);
              return null;
            }
          })
        );

        const validUrls = urls.filter((url): url is string => url !== null);
        setImageUrls(validUrls);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();

    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [bots]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      setSubmissionStatus("Generating image...");
      console.log("Generating image...");
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

      setSubmissionStatus("Processing image data...");
      const blob = await fetch(`data:image/png;base64,${rawResponse}`).then(
        (r) => r.blob()
      );
      console.log("blob: ", blob);
      const objectUrl = URL.createObjectURL(blob);

      setSubmissionStatus("Publishing site...");
      console.log("Publishing site..." + objectUrl);
      const publishRes = await fetch(`${apiUrl}/publish-site`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blobId, botWallet: wallet, tokenId, name }),
      });
      const { url } = await publishRes.json();
      console.log("Url:", url);
      if (!url) throw new Error("Failed to publish");

      setSubmissionStatus("Submitting transaction...");
      console.log("Submitting transaction...");
      const tx = await client?.writeContract({
        abi: ABI,
        address: ADDRESS,
        functionName: "createBot",
        args: [name, blobId, url, wallet],
      });
      console.log(tx);

      setSubmissionStatus("Bot created successfully!");
      setNewBotUrl(url);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionStatus("");
        setIsDialogOpen(false);
        setShowAlert(true);
      }, 2000);
      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error writing contract:", error);
      setSubmissionStatus("Error creating bot. Please try again.");
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionStatus("");
      }, 2000);
    }
  };

  const handleSubscribe = async (index: number) => {
    try {
      if (index < 0 || index >= (bots?.length || 0))
        throw new Error("Invalid bot index");
      const tx = await client?.writeContract({
        abi: ABI,
        address: ADDRESS,
        functionName: "subscribe",
        args: [BigInt(index)],
        value: parseEther("0.001"),
      });
      console.log(tx);
      // Handle successful subscription (e.g., show a success message)
    } catch (err) {
      console.error("Error subscribing:", err);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">AI Fans</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-purple-800 hover:bg-purple-900 text-white text-xl py-6 px-12 rounded-full shadow-lg transform transition duration-300 hover:scale-105"
              onClick={() => setIsDialogOpen(true)}
            >
              Create
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl text-black font-bold">
                Create
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Fill in the details to create your new AI Partner.
              </DialogDescription>
            </DialogHeader>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4 text-black" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <div className="grid gap-6 py-4">
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              />
              <Textarea
                placeholder="Prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <DialogFooter className="flex flex-col items-center">
              <Button
                onClick={handleSubmit}
                className="bg-purple-800 hover:bg-purple-900 text-white w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {submissionStatus}
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ConnectKitButton />
      </header>

      {showAlert && (
        <Alert className="mb-4 bg-green-100 border-green-400 text-green-700">
          <AlertTitle>New bot is ready!</AlertTitle>
          <AlertDescription className="flex items-center">
            Your new bot has been created successfully.
            <Button
              variant="link"
              className="ml-2 text-green-700"
              onClick={() =>
                window.open(newBotUrl, "_blank", "noopener,noreferrer")
              }
            >
              View <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots?.map((bot, index) => (
          <Card
            key={index}
            className="overflow-hidden shadow-lg rounded-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setSelectedBot({ ...bot, index })}
          >
            <CardContent className="p-0 relative">
              <img
                src={imageUrls[index]}
                alt={bot.name}
                className="w-full h-80 object-cover"
              />
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500" />
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-3 p-4 bg-white bg-opacity-50">
              <h2 className="text-xl font-semibold text-black mt-1">
                {bot.name}
              </h2>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedBot} onOpenChange={() => setSelectedBot(null)}>
        <DialogContent className="bg-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              {selectedBot?.name}
            </DialogTitle>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 text-black" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="mt-4">
            <img
              src={imageUrls[selectedBot?.index]}
              alt={selectedBot?.name}
              className="w-full object-contain rounded-lg"
              style={{ maxHeight: "400px" }}
            />
            <p className="mt-4 text-gray-600">{selectedBot?.description}</p>
          </div>
          <div className="flex flex-col space-y-4 mt-6">
            <Button
              className="bg-purple-800 hover:bg-purple-900 text-white w-full"
              onClick={() => handleSubscribe(selectedBot.index + 1)}
              disabled={isSubscribed}
            >
              Subscribe
            </Button>
            <div className="flex justify-between space-x-4">
              <Button
                className="bg-white hover:bg-gray-100 text-black border border-black w-1/2"
                disabled={!isSubscribed}
                onClick={() =>
                  window.open(
                    `https://app.converse.xyz/conversation`,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Chat <MessageSquare className="ml-2 h-4 w-4" />
              </Button>
              <Button
                className="bg-white hover:bg-gray-100 text-black border border-black w-1/2"
                onClick={() =>
                  window.open(
                    selectedBot.walrusSite,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                View in Full Screen <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PopupAds />
    </div>
  );
}
