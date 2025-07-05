import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { getSocketConfig } from '@/config/socket';

// Define vote event types
interface VoteEventData {
  poolId: string;
  vote: "yes" | "no";
  voterAddress?: string;
  question: string;
  blockchain: string;
  timestamp: string;
}

interface ServerToClientEvents {
  "vote-notification": (data: VoteEventData) => void;
  "user-count": (count: number) => void;
}

interface ClientToServerEvents {
  "vote-event": (data: VoteEventData) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

interface PredictionPoolProps {
  id: string;
  question: string;
  totalAmount: number;
  yesVotes: number;
  noVotes: number;
  endsAt: string;
  participationAmount: number;
  onVote?: (poolId: string, vote: "yes" | "no") => void;
}

const PredictionPool = ({ 
  id,
  question, 
  totalAmount, 
  yesVotes, 
  noVotes, 
  endsAt, 
  participationAmount,
  onVote 
}: PredictionPoolProps) => {
  const totalVotes = yesVotes + noVotes;
  const [timeLeft, setTimeLeft] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Get wallet addresses from both Privy and Wagmi
  const { authenticated: privyAuthenticated } = usePrivy();
  const { wallets: privyWallets } = useWallets();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();

  // Get current user's address
  const getCurrentUserAddress = (): string | undefined => {
    if (wagmiConnected && wagmiAddress) {
      return wagmiAddress;
    }
    if (privyAuthenticated && privyWallets.length > 0) {
      return privyWallets[0].address;
    }
    return undefined;
  };

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        if (!socket) {
          const socketConfig = getSocketConfig();
          console.log('Connecting to Socket.IO server:', socketConfig.url);
          
          socket = io(socketConfig.url, socketConfig.options);

          socket.on("connect", () => {
            console.log('Socket.IO connected successfully');
            setIsSocketConnected(true);
          });

          socket.on("disconnect", () => {
            console.log('Socket.IO disconnected');
            setIsSocketConnected(false);
          });

          socket.on("connect_error", (error) => {
            console.error('Socket.IO connection error:', error);
            setIsSocketConnected(false);
          });

          // Listen for vote notifications from other users
          socket.on("vote-notification", (data) => {
            // Don't show notification for our own votes
            const currentUserAddress = getCurrentUserAddress();
            if (data.voterAddress && currentUserAddress && 
                data.voterAddress.toLowerCase() === currentUserAddress.toLowerCase()) {
              return;
            }

            // Only show notification for votes on this specific pool
            if (data.poolId === id) {
              const voteEmoji = data.vote === "yes" ? "✅" : "❌";
              const voterDisplay = data.voterAddress 
                ? `${data.voterAddress.slice(0, 6)}...${data.voterAddress.slice(-4)}`
                : "Someone";
              
              toast(`${voteEmoji} ${voterDisplay} voted ${data.vote.toUpperCase()}!`, {
                description: `On ${data.blockchain} blockchain`,
                duration: 4000,
              });
            }
          });
        }
      } catch (error) {
        console.error("Socket.IO initialization error:", error);
        setIsSocketConnected(false);
      }
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(endsAt).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${days}d : ${hours}h : ${minutes}m`);
      } else {
        setTimeLeft('Ended');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endsAt]);

  const broadcastVote = (vote: "yes" | "no") => {
    if (socket && isSocketConnected) {
      const blockchain = id.startsWith('flow-') ? 'Flow' : id.startsWith('ronin-') ? 'Ronin' : 'Blockchain';
      const voterAddress = getCurrentUserAddress();

      socket.emit("vote-event", {
        poolId: id,
        vote,
        voterAddress,
        question,
        blockchain,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleVote = (vote: "yes" | "no") => {
    if (onVote) {
      onVote(id, vote);
    }
    
    // Broadcast vote to other users
    broadcastVote(vote);
  };

  const handleShareToTwitter = () => {
    // Determine the blockchain based on pool ID
    const blockchain = id.startsWith('flow-') ? 'Flow' : id.startsWith('ronin-') ? 'Ronin' : 'Blockchain';
    
    // Create engaging tweet text
    const tweetText = `🔮 Prediction Market Alert!\n\n"${question}"\n\n💰 Pool: $${totalAmount} | Entry: $${participationAmount}\n⏰ ${timeLeft === 'Ended' ? 'Pool Ended' : `Ends in: ${timeLeft}`}\n\n🚀 Vote on ${blockchain} blockchain at PredictMeBro!\n\n#PredictionMarket #${blockchain} #Web3 #Crypto`;
    
    // Get current URL for sharing
    const currentUrl = window.location.origin + window.location.pathname;
    
    // Create Twitter/X sharing URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(currentUrl)}`;
    
    // Open Twitter in new tab
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    
    // Show success toast
    toast.success("Opening Twitter/X", {
      description: "Share this prediction with your friends!",
      duration: 3000,
    });
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg text-foreground flex-1">{question}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {totalVotes} votes
            </Badge>
            {isSocketConnected ? (
              <div className="w-2 h-2 rounded-full bg-green-500" title="Real-time connected"></div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-red-500" title="Real-time disconnected"></div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareToTwitter}
              className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
              title="Share on Twitter/X"
            >
              <Twitter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Entry: ${participationAmount}</span>
          <span>Pool: ${totalAmount}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Anonymous voting</p>
            {isSocketConnected ? (
              <p className="text-xs text-green-400 mt-1">🔴 Live notifications</p>
            ) : (
              <p className="text-xs text-red-400 mt-1">⚫ Offline mode</p>
            )}
          </div>
        </div>
        
        <div className="mt-auto space-y-4">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1 h-10 bg-green-500/10 border-green-500/20 hover:bg-green-500/20 text-green-400"
              onClick={() => handleVote("yes")}
              disabled={timeLeft === 'Ended'}
            >
              Vote YES
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-10 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
              onClick={() => handleVote("no")}
              disabled={timeLeft === 'Ended'}
            >
              Vote NO
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            {timeLeft === 'Ended' ? 'Pool Ended' : `Ends in: ${timeLeft}`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionPool; 