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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEscrowContract } from "@/hooks/useEscrowContract";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";

interface CreatePoolModalProps {
  onPoolCreated?: () => void;
}

const CreatePoolModal = ({ onPoolCreated }: CreatePoolModalProps) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [participationAmount, setParticipationAmount] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { createPool } = useEscrowContract();
  const { address } = useAccount();
  const { authenticated } = usePrivy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !participationAmount || !creatorName.trim()) {
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
      await createPool(creatorName.trim(), question.trim(), amount);
      
      // Reset form
      setQuestion("");
      setParticipationAmount("");
      setCreatorName("");
      setOpen(false);
      
      toast({
        title: "Pool Created!",
        description: "Your prediction pool has been created successfully.",
      });

      if (onPoolCreated) {
        onPoolCreated();
      }
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
      
      <DialogContent className="sm:max-w-md border-slate-700">
        <DialogHeader>
          <DialogTitle>Create Prediction Pool</DialogTitle>
          <DialogDescription>
            Create a new prediction market for others to vote on.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creatorName" className="text-white">
              Your Name
            </Label>
            <Input
              id="creatorName"
              placeholder="e.g., Giovanni"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question" className="text-white">
              Question
            </Label>
            <Textarea
              id="question"
              placeholder="e.g., Will Armando become vegetarian by end of 2024?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 resize-none focus:border-purple-500 focus:ring-purple-500"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">
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
              className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-400">This amount will be required to participate in the pool</p>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Pool"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePoolModal; 