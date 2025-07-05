"use client";

import { usePrivy, useWallets, useLoginWithEmail } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import { Wallet, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FlowConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { sendCode, loginWithCode } = useLoginWithEmail();
  
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    try {
      await sendCode({ email });
      setCodeSent(true);
      toast.success("Verification code sent!", {
        description: "Check your email for the login code"
      });
    } catch (error) {
      toast.error("Failed to send code", {
        description: "Please try again"
      });
    }
  };

  const handleLoginWithCode = async () => {
    try {
      await loginWithCode({ code });
      setShowEmailLogin(false);
      setEmail('');
      setCode('');
      setCodeSent(false);
      toast.success("Successfully connected to Flow!", {
        description: "Your wallet is ready for Flow transactions"
      });
    } catch (error) {
      toast.error("Invalid verification code", {
        description: "Please check your code and try again"
      });
    }
  };

  const handleDisconnect = () => {
    logout();
    toast.info("Disconnected from Flow");
  };

  if (!ready) {
    return (
      <Button variant="outline" disabled className="flex items-center space-x-2">
        <Wallet className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }

  if (authenticated && user) {
    const wallet = wallets[0];
    const address = wallet?.address;
    
    return (
      <div className="flex items-center space-x-2 cursor-pointer" onClick={handleDisconnect}>
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">F</span>
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-white">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : user.email?.address || 'Connected'}
          </div>
          <div className="text-xs text-gray-400">
            Flow Network
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={showEmailLogin} onOpenChange={setShowEmailLogin}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 border-purple-600 text-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Flow</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span>Connect to Flow</span>
          </DialogTitle>
          <DialogDescription>
            Connect with your email or external wallet to access Flow blockchain features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!codeSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleSendCode}
                  disabled={!email}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Verification Code
                </Button>
                
                <Button
                  onClick={() => login()}
                  variant="outline"
                  className="w-full border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect External Wallet
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-white">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleLoginWithCode}
                  disabled={!code}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white"
                >
                  Verify & Connect
                </Button>
                
                <Button
                  onClick={() => {
                    setCodeSent(false);
                    setCode('');
                  }}
                  variant="outline"
                  className="w-full border-slate-600 text-gray-300 hover:bg-slate-800 hover:text-white"
                >
                  Back to Email
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 