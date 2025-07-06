import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, Zap, Shield } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
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
            <p className="text-xl sm:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              The future of decentralized prediction markets. 
              Create, participate, and earn from your predictions on Flow and Ronin blockchains.
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

      {/* Features Section */}
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
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Decentralized</CardTitle>
                <CardDescription className="text-gray-400">
                  Fully decentralized prediction markets powered by smart contracts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Multi-Chain</CardTitle>
                <CardDescription className="text-gray-400">
                  Support for Flow and Ronin blockchains with seamless wallet integration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white">Real-Time</CardTitle>
                <CardDescription className="text-gray-400">
                  Live updates and real-time voting with instant blockchain confirmation
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
