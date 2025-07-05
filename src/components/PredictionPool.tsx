import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

  const handleShareToTwitter = () => {
    const yesPercentage = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;
    const noPercentage = totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0;
    
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