"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { createPool, type Pool } from '@/config/supabase';
import { useEscrowPoolActions } from '@/hooks/useEscrowPool';

export default function CreatePoolForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    creatorName: '',
    question: '',
    description: '',
    pricePerVote: '',
    poolPrize: '',
    blockchain: 'ronin' as 'flow' | 'ronin', // Default to Ronin since smart contract is deployed there
    durationDays: '7'
  });

  // Get wallet addresses from both Privy and Wagmi
  const { authenticated: privyAuthenticated } = usePrivy();
  const { wallets: privyWallets } = useWallets();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();

  // Smart contract actions
  const { createPool: createPoolContract } = useEscrowPoolActions();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const creatorAddress = getCurrentUserAddress();
    if (!creatorAddress) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to create a pool"
      });
      return;
    }

    // Validation
    if (!formData.creatorName.trim()) {
      toast.error("Creator name is required");
      return;
    }

    if (!formData.question.trim()) {
      toast.error("Question is required");
      return;
    }

    const pricePerVote = parseFloat(formData.pricePerVote);
    const poolPrize = parseFloat(formData.poolPrize);
    const durationDays = parseInt(formData.durationDays);

    if (isNaN(pricePerVote) || pricePerVote <= 0) {
      toast.error("Please enter a valid price per vote");
      return;
    }

    if (isNaN(poolPrize) || poolPrize <= 0) {
      toast.error("Please enter a valid pool prize");
      return;
    }

    if (isNaN(durationDays) || durationDays <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    // Currently only support Ronin blockchain with smart contract
    if (formData.blockchain === 'flow') {
      toast.error("Smart contract not yet deployed on Flow", {
        description: "Please select Ronin blockchain"
      });
      return;
    }

    if (!wagmiConnected) {
      toast.error("Ronin wallet not connected", {
        description: "Please connect your Ronin wallet to create pools"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate start and end times
      const startTime = new Date();
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + durationDays);

      // Call smart contract to create pool
      toast.loading("Creating pool on blockchain...", { id: 'pool-creation' });
      
      await createPoolContract(
        formData.creatorName.trim(),
        formData.question.trim(),
        formData.pricePerVote,
        startTime,
        endTime,
        formData.poolPrize
      );

      // If smart contract call is successful, also save to database for tracking
      try {
        const poolData: Omit<Pool, 'id' | 'created_at' | 'updated_at'> = {
          question: formData.question.trim(),
          description: formData.description.trim() || undefined,
          total_amount: poolPrize,
          participation_amount: pricePerVote,
          yes_votes: 0,
          no_votes: 0,
          ends_at: endTime.toISOString(),
          blockchain: formData.blockchain,
          creator_address: creatorAddress
        };

        await createPool(poolData);
        
        toast.success("Pool created successfully! 🎉", {
          id: 'pool-creation',
          description: "Smart contract and database updated"
        });
      } catch (dbError) {
        console.warn('Database update failed, but smart contract succeeded:', dbError);
        toast.success("Pool created on blockchain! ⚠️", {
          id: 'pool-creation',
          description: "Smart contract succeeded, database sync failed"
        });
      }

      // Reset form
      setFormData({
        creatorName: '',
        question: '',
        description: '',
        pricePerVote: '',
        poolPrize: '',
        blockchain: 'ronin',
        durationDays: '7'
      });

    } catch (error) {
      console.error('Error creating pool:', error);
      toast.error("Failed to create pool", {
        id: 'pool-creation',
        description: error instanceof Error ? error.message : "Smart contract transaction failed"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConnected = wagmiConnected || privyAuthenticated;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">Create New Prediction Pool</CardTitle>
        <p className="text-sm text-muted-foreground">
          Deploy a new prediction market smart contract for others to vote on
        </p>
      </CardHeader>
      
      <CardContent>
        {!isConnected ? (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 font-semibold">⚠️ Wallet Required</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please connect your wallet to create prediction pools
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Creator Name */}
            <div className="space-y-2">
              <Label htmlFor="creatorName">Creator Name *</Label>
              <Input
                id="creatorName"
                placeholder="Your name or pseudonym"
                value={formData.creatorName}
                onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                required
              />
            </div>

            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question">Prediction Question *</Label>
              <Textarea
                id="question"
                placeholder="e.g., Will Bitcoin reach $100k by end of 2024?"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="min-h-[80px]"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional context or rules for the prediction..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[60px]"
              />
              <p className="text-xs text-muted-foreground">
                Note: Description is stored in database only, not on blockchain
              </p>
            </div>

            {/* Smart Contract Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerVote">Price Per Vote (ETH) *</Label>
                <Input
                  id="pricePerVote"
                  type="number"
                  step="0.001"
                  placeholder="0.01"
                  value={formData.pricePerVote}
                  onChange={(e) => setFormData({ ...formData, pricePerVote: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Amount users pay to vote</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="poolPrize">Pool Prize (ETH) *</Label>
                <Input
                  id="poolPrize"
                  type="number"
                  step="0.001"
                  placeholder="1.0"
                  value={formData.poolPrize}
                  onChange={(e) => setFormData({ ...formData, poolPrize: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Prize pool for winners</p>
              </div>
            </div>

            {/* Blockchain & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blockchain">Blockchain *</Label>
                <select
                  id="blockchain"
                  value={formData.blockchain}
                  onChange={(e) => setFormData({ ...formData, blockchain: e.target.value as 'flow' | 'ronin' })}
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-foreground"
                  required
                >
                  <option value="ronin">Ronin (Smart Contract Available)</option>
                  <option value="flow" disabled>Flow (Coming Soon)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationDays">Duration (Days) *</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="7"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Blockchain Warning */}
            {formData.blockchain === 'flow' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-400 font-semibold">⚠️ Flow Not Available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Smart contract is currently only deployed on Ronin blockchain
                </p>
              </div>
            )}

            {/* Connected Wallet Info */}
            <div className="p-3 bg-slate-800 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="text-green-400">✓ Connected as:</span>{" "}
                {getCurrentUserAddress()?.slice(0, 6)}...{getCurrentUserAddress()?.slice(-4)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {wagmiConnected ? "Ronin wallet connected" : "Flow wallet connected"}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting || formData.blockchain === 'flow'}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Pool on Blockchain...
                </>
              ) : (
                "Create Prediction Pool"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 