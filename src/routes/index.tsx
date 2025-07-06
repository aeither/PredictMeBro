import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, Zap, Shield } from 'lucide-react'
import { usePoolNotifications } from '@/hooks/usePoolNotifications'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  // Enable realtime pool creation notifications
  usePoolNotifications();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl"></div>
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              PredictMeBro
            </h1>
            <p className="text-xl sm:text-2xl mb-4 text-gray-300 max-w-4xl mx-auto">
              A decentralized, real-time sentiment prediction market made for everyone.
            </p>
            <p className="text-lg mb-8 text-gray-400 max-w-3xl mx-auto">
              Most prediction markets are complex and not built for everyday users. 
              We offer a simple Yes/No voting interface that anyone can use with real-time updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/flow">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Flow Markets
                </Button>
              </Link>
              <Link to="/ronin">
                <Button size="lg" variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                  <Zap className="mr-2 h-5 w-5" />
                  Ronin Markets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose PredictMeBro?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the next generation of prediction markets with cutting-edge blockchain technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Simple & Accessible</CardTitle>
                <CardDescription className="text-gray-400">
                  Easy Yes/No voting interface designed for everyone - no complex trading required
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Fully Decentralized</CardTitle>
                <CardDescription className="text-gray-400">
                  Transparent, trustless prediction markets powered by smart contracts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Multi-Chain Support</CardTitle>
                <CardDescription className="text-gray-400">
                  Support for Flow and Ronin blockchains with seamless wallet integration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Real-Time Updates</CardTitle>
                <CardDescription className="text-gray-400">
                  Live updates and real-time voting with instant blockchain confirmation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Join & Get Rewarded</CardTitle>
                <CardDescription className="text-gray-400">
                  Join markets, share your predictions, and earn rewards for accurate forecasts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Built for Everyone</CardTitle>
                <CardDescription className="text-gray-400">
                  No trading experience needed - if you can vote, you can predict and earn
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="glass-dark rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Start Predicting?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users making predictions and earning rewards on the most advanced prediction market platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/supabase-demo">
                <Button size="lg" className="bg-gradient-success hover:opacity-90 text-white">
                  Try Live Demo
                </Button>
              </Link>
              <Link to="/flow">
                <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                  Explore Markets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
