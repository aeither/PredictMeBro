import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePrivy, useWallets } from '@privy-io/react-auth';
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

  // Get wallet addresses from Privy
  const { authenticated: privyAuthenticated } = usePrivy();
  const { wallets: privyWallets } = useWallets();

  // Get current user's address
  const getCurrentUserAddress = (): string | undefined => {
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareToTwitter}
              className="p-1 h-6 w-6 border-gray-600 hover:bg-gray-800"
            >
              <Twitter className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Pool Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">${totalAmount}</div>
              <div className="text-gray-400">Total Pool</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">${participationAmount}</div>
              <div className="text-gray-400">To Participate</div>
            </div>
          </div>

          {/* Voting Results */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Yes ({yesVotes})</span>
              <span className="text-sm text-gray-300">
                {totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">No ({noVotes})</span>
              <span className="text-sm text-gray-300">
                {totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Time Left */}
          <div className="text-center">
            <div className="text-sm text-gray-400">
              {timeLeft === 'Ended' ? '🔒 Pool Ended' : `⏰ ${timeLeft} left`}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          <Button
            onClick={() => handleVote('yes')}
            disabled={timeLeft === 'Ended'}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Vote Yes
          </Button>
          <Button
            onClick={() => handleVote('no')}
            disabled={timeLeft === 'Ended'}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Vote No
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionPool; 