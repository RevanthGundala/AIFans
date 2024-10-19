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

type Profile = {
  id: number;
  name: string;
  image: string;
  isOnline: boolean;
};

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDescription, setNewProfileDescription] = useState("");

  useEffect(() => {
    // Simulating fetching profiles
    setProfiles([
      {
        id: 1,
        name: "Alex",
        image: "/placeholder.svg?height=300&width=300",
        isOnline: true,
      },
      {
        id: 2,
        name: "Sam",
        image: "/placeholder.svg?height=300&width=300",
        isOnline: false,
      },
      {
        id: 3,
        name: "Jordan",
        image: "/placeholder.svg?height=300&width=300",
        isOnline: true,
      },
      {
        id: 4,
        name: "Taylor",
        image: "/placeholder.svg?height=300&width=300",
        isOnline: false,
      },
      {
        id: 5,
        name: "Casey",
        image: "/placeholder.svg?height=300&width=300",
        isOnline: true,
      },
      {
        id: 6,
        name: "Riley",
        image: "/placeholder.svg?height=300&width=300",
        isOnline: false,
      },
    ]);
  }, []);

  const handleCreateProfile = () => {
    // Here you would typically send this data to your backend
    console.log("Creating profile:", {
      name: newProfileName,
      description: newProfileDescription,
    });
    // For now, let's just add it to our local state
    setProfiles((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newProfileName,
        image: "/placeholder.svg?height=300&width=300",
        isOnline: true,
      },
    ]);
  };

  const handleConnectWallet = () => {
    // This function does nothing for now
    console.log("Connect Wallet clicked");
  };

  return (
    <div className="container mx-auto p-4 bg-blue-100 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-500">ConnectMe</h1>
        <Button
          onClick={handleConnectWallet}
          className="bg-blue-400 hover:bg-blue-500"
        >
          Connect Wallet
        </Button>
      </header>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6 bg-blue-400 hover:bg-blue-500">
            Create Profile
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Fill in the details to create your new profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Name"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={newProfileDescription}
              onChange={(e) => setNewProfileDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateProfile}
              className="bg-blue-400 hover:bg-blue-500"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="overflow-hidden bg-white">
            <CardContent className="p-0 relative">
              <img
                src={profile.image}
                alt={profile.name}
                className="w-full h-64 object-cover"
              />
              <div
                className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                  profile.isOnline ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-blue-500">
                {profile.name}
              </h2>
              <Button
                variant="outline"
                className="text-blue-400 border-blue-400 hover:bg-blue-100"
                onClick={() => console.log(`View profile of ${profile.name}`)}
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
