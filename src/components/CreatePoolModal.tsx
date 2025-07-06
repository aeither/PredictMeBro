import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEscrowContract } from "@/hooks/useEscrowContract";
import { useBroadcastPoolCreation } from "@/hooks/usePoolNotifications";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useLocation } from '@tanstack/react-router';

interface CreatePoolModalProps {
  onPoolCreated?: () => void;
}

// Time duration options in milliseconds
const TIME_OPTIONS = [
  { value: '300000', label: '5 minutes', hours: 0.083, seconds: 300 },
  { value: '900000', label: '15 minutes', hours: 0.25, seconds: 900 },
  { value: '1800000', label: '30 minutes', hours: 0.5, seconds: 1800 },
  { value: '3600000', label: '1 hour', hours: 1, seconds: 3600 },
  { value: '7200000', label: '2 hours', hours: 2, seconds: 7200 },
  { value: '14400000', label: '4 hours', hours: 4, seconds: 14400 },
  { value: '28800000', label: '8 hours', hours: 8, seconds: 28800 },
  { value: '86400000', label: '1 day', hours: 24, seconds: 86400 },
  { value: '172800000', label: '2 days', hours: 48, seconds: 172800 },
  { value: '604800000', label: '1 week', hours: 168, seconds: 604800 },
];

const CreatePoolModal = ({ onPoolCreated }: CreatePoolModalProps) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [participationAmount, setParticipationAmount] = useState("");
  const [durationMilliseconds, setDurationMilliseconds] = useState("3600000"); // Default to 1 hour in milliseconds
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { createPool } = useEscrowContract();
  const { address } = useAccount();
  const { authenticated } = usePrivy();
  const { broadcastPoolCreation } = useBroadcastPoolCreation();
  const location = useLocation();

  // Function to fill form with working test data
  const fillTestData = () => {
    setQuestion("Will Bitcoin reach $100,000 by end of 2024?");
    setParticipationAmount("0.01");
    setDurationMilliseconds("7200000"); // 2 hours in milliseconds
    toast({
      title: "Test Data Loaded",
      description: "Form filled with working test data. You can edit and submit.",
    });
  };

  // Get the end time based on selected duration
  const getEndTime = () => {
    const now = Date.now(); // Current time in milliseconds
    const endTime = now + parseInt(durationMilliseconds);
    return new Date(endTime).toLocaleString();
  };

  // Get duration in hours for the createPool function
  const getDurationHours = () => {
    const option = TIME_OPTIONS.find(opt => opt.value === durationMilliseconds);
    return option ? option.hours : 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !participationAmount || !durationMilliseconds) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!authenticated || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a pool.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(participationAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Participation amount must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const durationHours = getDurationHours();
      await createPool(question.trim(), amount, durationHours);
      
      // Reset form
      setQuestion("");
      setParticipationAmount("");
      setDurationMilliseconds("3600000");
      setOpen(false);
      
      toast({
        title: "Pool Created!",
        description: "Your prediction pool has been created successfully.",
      });

      if (onPoolCreated) {
        onPoolCreated();
      }

      // Broadcast pool creation event for realtime notifications
      const blockchain = location.pathname.includes('/flow') ? 'flow' : 'ronin';
      await broadcastPoolCreation({
        question: question.trim(),
        blockchain,
        totalAmount: amount,
        creatorAddress: address || '',
      });
    } catch (error) {
      console.error('Error creating pool:', error);
      toast({
        title: "Error Creating Pool",
        description: "Failed to create the pool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white shadow-lg text-lg px-8 py-6 rounded-xl"
        >
          <Plus className="w-6 h-6 mr-2" />
          Create New Pool
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md glass-card border-slate-600/50 bg-slate-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Create Prediction Pool</DialogTitle>
          <DialogDescription className="text-gray-300">
            Create a new prediction market for others to vote on. Creator will be your connected wallet address.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-white font-medium">
              Question
            </Label>
            <Textarea
              id="question"
              placeholder="e.g., How many IRL ethglobal events will be happening in 2026?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-slate-800/80 border-slate-600/50 text-white placeholder:text-gray-400 resize-none focus:border-purple-500 focus:ring-purple-500/50 backdrop-blur-sm"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white font-medium">
              Participation Amount (ETH)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.01"
              min="0.001"
              step="0.001"
              value={participationAmount}
              onChange={(e) => setParticipationAmount(e.target.value)}
              className="bg-slate-800/80 border-slate-600/50 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/50 backdrop-blur-sm"
            />
            <p className="text-xs text-gray-400">This amount will be required to participate in the pool</p>
            {participationAmount && (
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg backdrop-blur-sm">
                <p className="text-xs text-yellow-300 font-medium">
                  Pool creation cost: {(parseFloat(participationAmount) * 10).toFixed(3)} ETH
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-white font-medium flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pool Duration</span>
            </Label>
            <Select value={durationMilliseconds} onValueChange={setDurationMilliseconds}>
              <SelectTrigger className="bg-slate-800/80 border-slate-600/50 text-white focus:border-purple-500 focus:ring-purple-500/50 backdrop-blur-sm">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                {TIME_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">How long the pool will be active</p>
              {durationMilliseconds && (
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm">
                  <p className="text-xs text-blue-300 font-medium">
                    Pool will end: {getEndTime()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Test Data Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={fillTestData}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 text-yellow-300 hover:from-yellow-600/30 hover:to-orange-600/30 hover:text-yellow-200 backdrop-blur-sm transition-all duration-200"
            >
              📝 Fill Test Data
            </Button>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isCreating}
              className="flex-1 bg-slate-800/50 border border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white disabled:opacity-50 transition-all duration-200 shadow-lg"
            >
              {isCreating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Pool"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePoolModal; 