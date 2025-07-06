import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter, Gift, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatEth } from '@/lib/formatCurrency';

interface PredictionPoolProps {
  id: string;
  question: string;
  totalAmount: number;
  yesVotes: number;
  noVotes: number;
  endsAt: string;
  participationAmount: number;
  claimableAmount?: number;
  isResolved?: boolean;
  onVote?: (poolId: string, vote: "yes" | "no") => void;
  onClaim?: (poolId: string) => void;
  onResolve?: (poolId: string, winningVote: boolean) => void;
}

const PredictionPool = ({ 
  id,
  question, 
  totalAmount, 
  yesVotes: _yesVotes, // Anonymous voting - not displayed
  noVotes: _noVotes, // Anonymous voting - not displayed 
  endsAt, 
  participationAmount,
  claimableAmount = 0,
  isResolved,
  onVote,
  onClaim,
  onResolve
}: PredictionPoolProps) => {
  // const totalVotes = yesVotes + noVotes; // Anonymous voting - not showing vote counts
  const [timeLeft, setTimeLeft] = useState('');

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

  const handleVote = (vote: "yes" | "no") => {
    if (onVote) {
      onVote(id, vote);
    }
  };

  const handleClaim = () => {
    if (onClaim) {
      onClaim(id);
    }
  };

  const handleResolve = (winningVote: boolean) => {
    if (onResolve) {
      onResolve(id, winningVote);
    }
  };

  const handleShareToTwitter = () => {
    // Determine the blockchain based on pool ID
    const blockchain = id.startsWith('flow-') ? 'Flow' : id.startsWith('ronin-') ? 'Ronin' : 'Blockchain';
    
    // Create engaging tweet text
    const tweetText = `🔮 Prediction Market Alert!\n\n"${question}"\n\n💰 Pool: ${formatEth(totalAmount)} | Entry: ${formatEth(participationAmount)}\n⏰ ${timeLeft === 'Ended' ? 'Pool Ended' : `Ends in: ${timeLeft}`}\n🔒 Anonymous voting until pool ends\n\n🚀 Vote on ${blockchain} blockchain at PredictMeBro!\n\n#PredictionMarket #${blockchain} #Web3 #Crypto`;
    
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

  // Format question for better display
  const formatQuestion = (question: string) => {
    // If it's a generated pool name (starts with pool_), create a better title
    if (question.startsWith('pool_')) {
      const parts = question.split('_');
      if (parts.length >= 3) {
        // Extract meaningful parts and create a readable title
        const timestamp = parts[1];
        const description = parts.slice(2).join(' ').replace(/[_-]/g, ' ');
        return `Pool #${timestamp.slice(-6)}: ${description}`;
      }
    }
    return question;
  };

  const displayQuestion = formatQuestion(question);
  const isLongTitle = displayQuestion.length > 50;

  return (
    <Card className="glass-card border-0 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle 
              className={`text-white font-semibold leading-tight ${
                isLongTitle ? 'text-sm' : 'text-base'
              }`}
              title={displayQuestion} // Full text on hover
            >
              <div className={isLongTitle ? 'line-clamp-2' : 'line-clamp-3'}>
                {displayQuestion}
              </div>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-xs bg-purple-900/50 text-purple-200 border-purple-700/50">
              Anonymous
            </Badge>
            <Button
              size="sm"
              onClick={handleShareToTwitter}
              className="p-1 h-6 w-6 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-blue-500/30 text-blue-400 hover:from-blue-600/50 hover:to-cyan-600/50 hover:text-blue-300 backdrop-blur-sm"
              title="Share on Twitter"
            >
              <Twitter className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        <div className="space-y-4">
          {/* Pool Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-900/20 border border-green-700/30">
              <div className="text-xl font-bold text-green-300">{formatEth(totalAmount)}</div>
              <div className="text-xs text-green-200/80 font-medium">Total Pool</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
              <div className="text-xl font-bold text-purple-300">{formatEth(participationAmount)}</div>
              <div className="text-xs text-purple-200/80 font-medium">To Participate</div>
            </div>
          </div>

          {/* Claimable Amount Display */}
          {claimableAmount > 0 && (
            <div className="text-center p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/30">
              <div className="text-xl font-bold text-yellow-300">{formatEth(claimableAmount)}</div>
              <div className="text-xs text-yellow-200/80 font-medium">Available to Claim</div>
            </div>
          )}

          {/* Time Left */}
          <div className="text-center p-2 rounded-lg bg-gray-800/40 border border-gray-700/30">
            <div className={`text-sm font-medium ${
              timeLeft === 'Ended' ? 'text-red-300' : 'text-blue-300'
            }`}>
              {timeLeft === 'Ended' ? '🔒 Pool Ended' : `⏰ ${timeLeft} left`}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          {claimableAmount > 0 ? (
            // Show Claim button when claimableAmount > 0
            <Button
              onClick={handleClaim}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-700 hover:to-orange-600 text-white font-semibold py-2.5 rounded-lg border border-yellow-500/30 shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              Claim Reward
            </Button>
          ) : timeLeft === 'Ended' && !isResolved ? (
            // Show Resolve buttons when pool ended but not resolved
            <>
              <Button
                onClick={() => handleResolve(true)}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-2.5 rounded-lg border border-green-500/30 shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve Yes
              </Button>
              <Button
                onClick={() => handleResolve(false)}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-2.5 rounded-lg border border-red-500/30 shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Resolve No
              </Button>
            </>
          ) : timeLeft === 'Ended' && isResolved ? (
            // Show resolved status when pool is resolved
            <div className="flex-1 bg-gradient-to-r from-gray-600 to-gray-500 text-white font-semibold py-2.5 rounded-lg border border-gray-500/30 shadow-lg flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Pool Resolved
            </div>
          ) : (
            // Show Yes/No buttons when pool is active
            <>
              <Button
                onClick={() => handleVote('yes')}
                disabled={timeLeft === 'Ended'}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-2.5 rounded-lg border border-green-500/30 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                👍 Vote Yes
              </Button>
              <Button
                onClick={() => handleVote('no')}
                disabled={timeLeft === 'Ended'}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-2.5 rounded-lg border border-red-500/30 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                👎 Vote No
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionPool; 