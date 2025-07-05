"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { io, Socket } from "socket.io-client"
import { getSocketConfig } from '@/config/socket'
import type { 
  ToastEventData, 
  ServerToClientEvents, 
  ClientToServerEvents 
} from "@/types/socket"

let socket: Socket<ServerToClientEvents, ClientToServerEvents>

export function ToastDemo() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState(0)

  useEffect(() => {
    // Initialize Socket.IO connection
    const initializeSocket = async () => {
      try {
        const socketConfig = getSocketConfig()
        console.log('Toast Demo connecting to Socket.IO server:', socketConfig.url)
        
        // Connect to Socket.IO server
        socket = io(socketConfig.url, socketConfig.options)

        socket.on("connect", () => {
          console.log("Toast Demo connected to Socket.IO server")
          setIsConnected(true)
        })

        socket.on("disconnect", () => {
          console.log("Toast Demo disconnected from Socket.IO server")
          setIsConnected(false)
        })

        socket.on("connect_error", (error) => {
          console.error("Toast Demo Socket.IO connection error:", error)
          setIsConnected(false)
        })

        // Listen for toast notifications from other devices
        socket.on("toast-notification", (data) => {
          console.log("Received toast notification:", data)
          
          switch(data.type) {
            case "simple":
              toast(data.message, {
                description: "📱 From another device"
              })
              break
            case "success":
              toast.success(data.message, {
                description: data.description + " 📱 From another device"
              })
              break
            case "error":
              toast.error(data.message, {
                description: data.description + " 📱 From another device"
              })
              break
            case "action":
              toast(data.message, {
                description: data.description + " 📱 From another device",
                action: {
                  label: "Undo",
                  onClick: () => toast("Undo clicked on remote toast!"),
                },
              })
              break
          }
        })

        socket.on("user-count", (count) => {
          setConnectedUsers(count)
        })

      } catch (error) {
        console.error("Toast Demo Socket.IO initialization error:", error)
        setIsConnected(false)
      }
    }

    initializeSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  const broadcastToast = (type: ToastEventData['type'], message: string, description?: string) => {
    if (socket && isConnected) {
      socket.emit("toast-event", {
        type,
        message,
        description,
        timestamp: new Date().toISOString()
      })
    }
  }

  const handleSimpleToast = () => {
    const message = "Simple toast message"
    toast(message)
    broadcastToast("simple", message)
  }

  const handleSuccessToast = () => {
    const message = "Success message"
    const description = "This is a success toast with description"
    toast.success(message, { description })
    broadcastToast("success", message, description)
  }

  const handleErrorToast = () => {
    const message = "Error message"
    const description = "This is an error toast with description"
    toast.error(message, { description })
    broadcastToast("error", message, description)
  }

  const handleActionToast = () => {
    const message = "Event created"
    const description = "Sunday, December 03, 2023 at 9:00 AM"
    toast(message, {
      description,
      action: {
        label: "Undo",
        onClick: () => toast("Undo clicked!"),
      },
    })
    broadcastToast("action", message, description)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Toast Demo with Socket.IO</h3>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          {connectedUsers > 0 && (
            <span className="text-gray-500">({connectedUsers} users)</span>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={handleSimpleToast}
        >
          Simple Toast
        </button>
        
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          onClick={handleSuccessToast}
        >
          Success Toast
        </button>
        
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          onClick={handleErrorToast}
        >
          Error Toast
        </button>
        
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          onClick={handleActionToast}
        >
          Action Toast
        </button>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>🌐 Toast notifications are broadcast to all connected devices!</p>
        <p>Open this page in multiple tabs or devices to see real-time sync.</p>
        <p className="mt-2">
          <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
        </p>
        <p>
          <strong>Socket URL:</strong> {isConnected ? 'Connected' : 'Connecting...'}
        </p>
      </div>
    </div>
  )
} 