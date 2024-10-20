import { useState, useEffect } from "react";
import { ArrowUpRight, Loader2, X } from "lucide-react";
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (!bots?.length) return;

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

  return (
    <div className="container mx-auto p-4 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">ConnectMe</h1>
        <ConnectKitButton />
      </header>

      {showAlert && (
        <Alert className="mb-4">
          <AlertTitle>New bot is ready!</AlertTitle>
          <AlertDescription className="flex items-center">
            Your new bot has been created successfully.
            <Button
              variant="link"
              className="ml-2 text-blue-500"
              onClick={() =>
                window.open(newBotUrl, "_blank", "noopener,noreferrer")
              }
            >
              View <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="mb-8 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            Create Bot
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Create New Bot
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Fill in the details to create your new bot.
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
              placeholder="Description"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <DialogFooter className="flex flex-col items-center">
            <Button
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots?.map((bot, i) => (
          <Card
            key={i}
            className="overflow-hidden bg-white shadow-lg rounded-lg transition-transform duration-300 hover:scale-105"
          >
            <CardContent className="p-0 relative">
              <img
                src={imageUrls[i]}
                alt={bot.name}
                className="w-full h-80 object-cover"
              />
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500" />
            </CardContent>
            <CardFooter className="flex flex-col items-start space-y-3 p-4">
              <h2 className="text-xl font-semibold text-gray-800 mt-2">
                {bot.name}
              </h2>
              <Button
                variant="outline"
                className="text-blue-500 border-blue-500 hover:bg-blue-50 transition-colors duration-300"
                onClick={() =>
                  window.open(bot.walrusSite, "_blank", "noopener,noreferrer")
                }
              >
                View Profile
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PopupAds />
    </div>
  );
}
