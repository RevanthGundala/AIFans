import React, { useState, useEffect } from "react";
import { X, Heart, Gift, Star, DollarSign, Camera } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const adMessages = [
  {
    title: "🔥 Hot Singles In Your Area!",
    content: "Meet AI models near you looking for love!",
  },
  {
    title: "💰 LIMITED TIME OFFER!",
    content: "Subscribe now and get 50% off your first month!",
  },
  {
    title: "🎁 Claim Your Free Credits",
    content: "Get 100 free credits to spend with any AI model!",
  },
  {
    title: "⭐ VIP Access Unlocked!",
    content: "Exclusive content waiting for you!",
  },
  {
    title: "📸 New Spicy Pictures",
    content: "Your favorite AI model just posted new content!",
  },
];

export const PopupAds = () => {
  const [activeAds, setActiveAds] = useState([]);
  const [showMainPopup, setShowMainPopup] = useState(false);
  const [showFloatingHearts, setShowFloatingHearts] = useState(false);

  // Function to create a new ad
  const createAd = () => {
    const newAd = {
      id: Math.random(),
      ...adMessages[Math.floor(Math.random() * adMessages.length)],
      position: {
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 70}%`,
      },
    };
    setActiveAds((prev) => [...prev, newAd]);
  };

  // Spawn ads periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeAds.length < 3) {
        createAd();
      }
    }, 10000);

    // Show main popup after 3 seconds
    const popupTimer = setTimeout(() => {
      setShowMainPopup(true);
    }, 20000);

    // Toggle floating hearts
    const heartTimer = setInterval(() => {
      setShowFloatingHearts((prev) => !prev);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(popupTimer);
      clearInterval(heartTimer);
    };
  }, [activeAds]);

  const removeAd = (id) => {
    setActiveAds((prev) => prev.filter((ad) => ad.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Floating Ads */}
      {activeAds.map((ad) => (
        <Card
          key={ad.id}
          className="absolute p-4 w-72 shadow-lg pointer-events-auto bg-white/90 backdrop-blur-sm animate-bounce"
          style={{ top: ad.position.top, left: ad.position.left }}
          onClick={() => removeAd(ad.id)}
        >
          <div className="flex justify-between items-start">
            <AlertTitle className="text-lg font-bold">{ad.title}</AlertTitle>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={() => removeAd(ad.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AlertDescription className="mt-2">{ad.content}</AlertDescription>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="bg-blue-400 hover:bg-blue-500">
              Subscribe Now!
            </Button>
            <Button size="sm" variant="outline">
              Maybe Later
            </Button>
          </div>
        </Card>
      ))}

      {/* Main Popup Dialog */}
      <Dialog open={showMainPopup} onOpenChange={setShowMainPopup}>
        <DialogContent className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
          <div className="relative p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">🌟 SPECIAL OFFER! 🌟</h2>
              <p className="mb-4">Subscribe now and get:</p>
              <ul className="text-left space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4" /> Unlimited messages
                </li>
                <li className="flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Exclusive photo requests
                </li>
                <li className="flex items-center gap-2">
                  <Gift className="h-4 w-4" /> Daily rewards
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> 50% off first month
                </li>
              </ul>
              <Button className="bg-white text-pink-500 hover:bg-gray-100 w-full">
                Claim Your Offer Now!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Hearts */}
      {showFloatingHearts && (
        <div className="fixed bottom-0 right-0 animate-float">
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              className="text-pink-500 absolute"
              style={{
                bottom: `${i * 30}px`,
                right: `${Math.sin(i) * 20 + 20}px`,
                opacity: 1 - i * 0.2,
                animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Add custom animation for floating effect */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
