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

interface CreatePoolModalProps {
  onCreatePool: (pool: { question: string; participationAmount: number }) => void;
}

const CreatePoolModal = ({ onCreatePool }: CreatePoolModalProps) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [participationAmount, setParticipationAmount] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !participationAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
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

    onCreatePool({
      question: question.trim(),
      participationAmount: amount,
    });

    // Reset form
    setQuestion("");
    setParticipationAmount("");
    setOpen(false);
    
    toast({
      title: "Pool Created!",
      description: "Your prediction pool has been created successfully.",
    });
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
              Participation Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="10"
              min="0.01"
              step="0.01"
              value={participationAmount}
              onChange={(e) => setParticipationAmount(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white"
            >
              Create Pool
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePoolModal; 