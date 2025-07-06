import { usePrivy, useWallets, useLoginWithEmail } from '@privy-io/react-auth';
import { Button } from "@/components/ui/button";
import { Wallet, Mail, ArrowLeft, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
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
  
  const [showModal, setShowModal] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<'select' | 'email' | 'wallet'>('select');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wasConnecting, setWasConnecting] = useState(false);

  // Watch for authentication changes to show success message
  useEffect(() => {
    if (authenticated && wasConnecting) {
      toast.success("Successfully connected to Flow!", {
        description: "Your wallet is ready for Flow transactions"
      });
      setWasConnecting(false);
    }
  }, [authenticated, wasConnecting]);

  const resetModalState = () => {
    setConnectionMethod('select');
    setEmail('');
    setCode('');
    setCodeSent(false);
    setLoading(false);
  };

  const handleOpenModal = () => {
    resetModalState();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetModalState();
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await sendCode({ email: email.trim() });
      setCodeSent(true);
      toast.success("Verification code sent!", {
        description: "Check your email for the login code"
      });
    } catch (error) {
      console.error('Error sending code:', error);
      toast.error("Failed to send verification code", {
        description: "Please check your email and try again"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setLoading(true);
    setWasConnecting(true);
    try {
      await loginWithCode({ code: code.trim() });
      handleCloseModal();
    } catch (error) {
      console.error('Error logging in with code:', error);
      toast.error("Invalid verification code", {
        description: "Please check your code and try again"
      });
      setWasConnecting(false);
    } finally {
      setLoading(false);
    }
  };

  const handleExternalWalletLogin = async () => {
    setLoading(true);
    setWasConnecting(true);
    try {
      // Close the custom modal first to avoid double modal issue
      handleCloseModal();
      
      // Open Privy's wallet connection modal
      await login();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error("Could not log in with wallet", {
        description: "Please try connecting again."
      });
      setWasConnecting(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    logout();
    toast.info("Disconnected from Flow");
  };

  if (!ready) {
    return (
      <Button disabled className="flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 border-0 opacity-50 cursor-not-allowed">
        <Wallet className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }

  if (authenticated && user) {
    const wallet = wallets[0];
    const address = wallet?.address;
    
    return (
      <div className="flex items-center space-x-2 cursor-pointer group" onClick={handleDisconnect}>
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">F</span>
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-white group-hover:text-gray-300 transition-colors">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : user.email?.address || 'Connected'}
          </div>
          <div className="text-xs text-gray-400">
            Flow Network • Click to disconnect
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleOpenModal}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg backdrop-blur-sm"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Flow</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md border-slate-700 bg-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">F</span>
            </div>
            <span>Connect to Flow</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {connectionMethod === 'select' && "Choose how you'd like to connect to Flow blockchain"}
            {connectionMethod === 'email' && "Enter your email to receive a verification code"}
            {connectionMethod === 'wallet' && "Connect your existing wallet to Flow"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {connectionMethod === 'select' && (
            <div className="space-y-3">
              <Button
                onClick={() => setConnectionMethod('email')}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                size="lg"
              >
                <Mail className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Continue with Email</div>
                  <div className="text-xs opacity-90">Get a verification code</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setConnectionMethod('wallet')}
                variant="outline"
                className="w-full border-slate-600 text-black hover:bg-slate-700"
                size="lg"
              >
                <Wallet className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Connect Wallet</div>
                  <div className="text-xs opacity-70">MetaMask, WalletConnect, etc.</div>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          )}

          {connectionMethod === 'email' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  onClick={() => setConnectionMethod('select')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-300">Email Login</span>
              </div>

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
                      className="bg-slate-900 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSendCode}
                    disabled={!email.trim() || loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Verification Code
                      </>
                    )}
                  </Button>
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
                      className="bg-slate-900 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleLoginWithCode()}
                    />
                  </div>
                  
                  <Button
                    onClick={handleLoginWithCode}
                    disabled={!code.trim() || loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify & Connect'
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setCodeSent(false);
                      setCode('');
                    }}
                    variant="outline"
                    className="w-full border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Email
                  </Button>
                </div>
              )}
            </div>
          )}

          {connectionMethod === 'wallet' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  onClick={() => setConnectionMethod('select')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-300">External Wallet</span>
              </div>

              <div className="text-center py-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-300 mb-6">
                  Connect your existing wallet to access Flow blockchain features
                </p>
                <Button
                  onClick={handleExternalWalletLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white disabled:opacity-50"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 