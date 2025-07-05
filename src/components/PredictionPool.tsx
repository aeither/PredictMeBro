import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { supabase, insertVoteEvent, subscribeToVotes } from '@/config/supabase';

// Define vote event types
interface VoteEventData {
  poolId: string;
  vote: "yes" | "no";
  walletAddress?: string;
  blockchain: string;
}

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
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

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

  // Initialize Supabase Realtime connection
  useEffect(() => {
    const initializeRealtime = async () => {
      try {
        console.log('Connecting to Supabase Realtime...');
        
        // Subscribe to vote events
        const channel = subscribeToVotes((payload) => {
          const voteData = payload.data as VoteEventData;
          
          // Don't show notification for our own votes
          const currentUserAddress = getCurrentUserAddress();
          if (voteData.walletAddress && currentUserAddress && 
              voteData.walletAddress.toLowerCase() === currentUserAddress.toLowerCase()) {
            return;
          }

          // Only show notification for votes on this specific pool
          if (voteData.poolId === id) {
            const voteEmoji = voteData.vote === "yes" ? "✅" : "❌";
            const voterDisplay = voteData.walletAddress 
              ? `${voteData.walletAddress.slice(0, 6)}...${voteData.walletAddress.slice(-4)}`
              : "Someone";
            
            toast(`${voteEmoji} ${voterDisplay} voted ${voteData.vote.toUpperCase()}!`, {
              description: `On ${voteData.blockchain} blockchain`,
              duration: 4000,
            });
          }
        });

        // Check connection status
        if (channel) {
          setIsRealtimeConnected(true);
          console.log('Supabase Realtime connected successfully');
        }

        // Cleanup function
        return () => {
          if (channel) {
            supabase.removeChannel(channel);
          }
        };
        
      } catch (error) {
        console.error("Supabase Realtime initialization error:", error);
        setIsRealtimeConnected(false);
      }
    };

    const cleanup = initializeRealtime();

    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
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

  const broadcastVoteEvent = async (vote: "yes" | "no") => {
    const walletAddress = getCurrentUserAddress();
    
    if (walletAddress) {
      try {
        const blockchain = id.startsWith('flow-') ? 'flow' : 'ronin'; // Default to ronin if not flow
        
        await insertVoteEvent({
          poolId: id,
          vote,
          walletAddress,
          blockchain
        });
        
        console.log('Vote event inserted successfully');
      } catch (error) {
        console.error('Error inserting vote event:', error);
      }
    }
  };

  const handleVote = (vote: "yes" | "no") => {
    if (onVote) {
      onVote(id, vote);
    }
    
    // Insert vote event into database to trigger realtime notifications
    broadcastVoteEvent(vote);
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
            {isRealtimeConnected ? (
              <div className="w-2 h-2 rounded-full bg-green-500" title="Realtime connected"></div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-red-500" title="Realtime disconnected"></div>
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
            {isRealtimeConnected ? (
              <p className="text-xs text-green-400 mt-1">🔴 Live via Supabase DB</p>
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