"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { supabase, insertToastEvent, subscribeToToasts } from '@/config/supabase'
import { testSupabaseConnection } from '@/utils/test-supabase'

export default function ToastDemo() {
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  // Initialize Supabase Realtime connection
  useEffect(() => {
    const initializeRealtime = async () => {
      try {
        console.log('Toast Demo connecting to Supabase Realtime...')
        
        // Subscribe to toast events
        const channel = subscribeToToasts((payload) => {
          const data = payload.data as { title: string; description?: string; variant?: 'default' | 'destructive' }
          
          console.log('Toast Demo received realtime event:', data)
          
          if (data.variant === 'destructive') {
            toast.error(data.title, {
              description: data.description || "📱 From database realtime",
              duration: 4000,
            })
          } else {
            toast.success(data.title, {
              description: data.description || "📱 From database realtime",
              duration: 4000,
            })
          }
        })

        // Check connection status
        if (channel) {
          setIsRealtimeConnected(true)
          console.log('Toast Demo Supabase Realtime connected successfully')
        }

        // Cleanup function
        return () => {
          if (channel) {
            supabase.removeChannel(channel)
          }
        }
        
      } catch (error) {
        console.error("Toast Demo Supabase Realtime initialization error:", error)
        setIsRealtimeConnected(false)
      }
    }

    const cleanup = initializeRealtime()

    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn())
    }
  }, [])

  const broadcastMessage = async (title: string, description?: string, variant?: 'default' | 'destructive') => {
    try {
      await insertToastEvent({
        title,
        description,
        variant
      })
      console.log('Toast event inserted successfully')
    } catch (error) {
      console.error('Error inserting toast event:', error)
      toast.error("Database error", {
        description: "Failed to insert toast event",
        duration: 3000,
      })
    }
  }

  const handleTestConnection = async () => {
    toast.loading("Testing Supabase connection...", { id: 'connection-test' })
    
    try {
      const isWorking = await testSupabaseConnection()
      
      if (isWorking) {
        toast.success("Connection successful!", { 
          id: 'connection-test',
          description: "Database and realtime are working correctly" 
        })
      } else {
        toast.error("Connection failed!", { 
          id: 'connection-test',
          description: "Check console for details and setup guide" 
        })
      }
    } catch (error) {
      toast.error("Test failed!", { 
        id: 'connection-test',
        description: "See console for error details" 
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Toast Demo with Supabase Database Realtime</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Status:</span>
            {isRealtimeConnected ? (
              <span className="flex items-center gap-1 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Connected via Database
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Disconnected
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Test real-time notifications across multiple devices/tabs using Supabase database realtime.</p>
            <p className="mt-2">Open this page in multiple tabs or devices to see notifications triggered by database inserts!</p>
          </div>

          {/* Test Connection Button */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <h4 className="font-semibold mb-2 text-yellow-400">⚠️ Setup Required</h4>
            <p className="text-sm text-muted-foreground mb-3">
              If you're getting "Database error" messages, click the test button below to diagnose the issue.
            </p>
            <Button 
              onClick={handleTestConnection}
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            >
              🔍 Test Supabase Connection
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => broadcastMessage("Success!", "This is a success message from database", "default")}
              className="bg-green-600 hover:bg-green-700"
            >
              Insert Success Event
            </Button>
            <Button 
              onClick={() => broadcastMessage("Error!", "This is an error message from database", "destructive")}
              variant="destructive"
            >
              Insert Error Event
            </Button>
            <Button 
              onClick={() => broadcastMessage("Info", "General information from database", "default")}
              variant="outline"
            >
              Insert Info Event
            </Button>
            <Button 
              onClick={() => broadcastMessage("Warning", "Something needs attention", "default")}
              variant="outline"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            >
              Insert Warning Event
            </Button>
          </div>

          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <h4 className="font-semibold mb-2">Local Toast Examples</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button 
                onClick={() => toast.success("Local Success", { description: "This toast only shows on this device" })}
                variant="outline"
                size="sm"
              >
                Local Success
              </Button>
              <Button 
                onClick={() => toast.error("Local Error", { description: "This toast only shows on this device" })}
                variant="outline"
                size="sm"
              >
                Local Error
              </Button>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>• Database events appear on all connected devices in real-time</p>
            <p>• Local messages only appear on the current device</p>
            <p>• Uses Supabase postgres_changes for real-time updates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 