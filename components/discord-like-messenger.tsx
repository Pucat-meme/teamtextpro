'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Send, LogOut, UserCircle, Image, Mic, Link, Trash, Settings, Edit } from 'lucide-react'

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface Channel {
  id: number;
  name: string;
}

interface Message {
  id: number;
  channelId: number;
  userId: number;
  content: string;
  type: string;
  timestamp: string;
  user: User;
}

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

export default function DiscordLikeMessenger() {
  const [user, setUser] = useState<User | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannel, setCurrentChannel] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [showLoginForm, setShowLoginForm] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChannels()
  }, [])

  useEffect(() => {
    if (currentChannel !== null) {
      loadMessages(currentChannel)
    }
  }, [currentChannel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/channels')
      const loadedChannels = await response.json()
      setChannels(loadedChannels)
      if (loadedChannels.length > 0 && currentChannel === null) {
        setCurrentChannel(loadedChannels[0].id)
      }
    } catch (error) {
      console.error('Failed to load channels:', error)
    }
  }

  const loadMessages = async (channelId: number) => {
    try {
      const response = await fetch(`/api/messages/${channelId}`)
      const loadedMessages = await response.json()
      setMessages(loadedMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Username and password are required')
      return
    }

    try {
      if (isSignUp) {
        if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
          setError('This username is not available')
          return
        }
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, isAdmin: false }),
        })
        if (response.ok) {
          const newUser = await response.json()
          setUser(newUser)
          setShowLoginForm(false)
        } else {
          const error = await response.json()
          setError(error.error)
        }
      } else {
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        if (response.ok) {
          const loggedInUser = await response.json()
          setUser(loggedInUser)
          setShowLoginForm(false)
          if (loggedInUser.isAdmin) {
            setShowAdminPanel(true)
          }
        } else {
          setError('Invalid username or password')
        }
      }
    } catch (error) {
      setError('An error occurred during authentication')
      console.error('Authentication error:', error)
    }

    setUsername('')
    setPassword('')
  }

  const handleLogout = () => {
    setUser(null)
    setShowLoginForm(true)
    setCurrentChannel(null)
    setMessages([])
    setShowAdminPanel(false)
    setShowProfileEdit(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '' || !user || currentChannel === null) {
      return;
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: currentChannel,
          userId: user.id,
          content: inputMessage,
          type: 'text',
        }),
      })
      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setInputMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateChannel = async () => {
    if (!user?.isAdmin) return
    const channelName = prompt('Enter new channel name:')
    if (channelName) {
      try {
        const response = await fetch('/api/channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: channelName }),
        })
        if (response.ok) {
          await loadChannels()
        }
      } catch (error) {
        console.error('Failed to create channel:', error)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && currentChannel !== null && user) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelId: currentChannel,
              userId: user.id,
              content: e.target?.result as string,
              type: 'image',
            }),
          })
          if (response.ok) {
            await loadMessages(currentChannel)
          }
        } catch (error) {
          console.error('Failed to upload image:', error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && currentChannel !== null && user) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelId: currentChannel,
              userId: user.id,
              content: e.target?.result as string,
              type: 'audio',
            }),
          })
          if (response.ok) {
            await loadMessages(currentChannel)
          }
        } catch (error) {
          console.error('Failed to upload audio:', error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLinkSubmit = async () => {
    const url = prompt('Enter the URL:')
    if (url && currentChannel !== null && user) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelId: currentChannel,
            userId: user.id,
            content: url,
            type: 'link',
          }),
        })
        if (response.ok) {
          await loadMessages(currentChannel)
        }
      } catch (error) {
        console.error('Failed to submit link:', error)
      }
    }
  }

  const AdminPanel = () => (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Admin Panel</h3>
      <Button onClick={handleCreateChannel} className="w-full mb-2 bg-[#00ffff] hover:bg-[#00cccc] text-gray-900">
        Create New Channel
      </Button>
      <Button onClick={() => setShowAdminPanel(false)} className="w-full bg-gray-600 hover:bg-gray-700 text-white">
        Close Admin Panel
      </Button>
    </div>
  )

  if (showLoginForm) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#ff00ff] to-[#00ffff]">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-gray-900 rounded-lg shadow-xl w-96"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">{isSignUp ? 'Sign Up' : 'Login'}</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleAuth} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 text-white border-gray-700"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 text-white border-gray-700"
              required
            />
            <Button type="submit" className="w-full bg-[#00ffff] hover:bg-[#00cccc] text-gray-900 font-bold">
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
          </form>
          <Button
            type="button"
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-4 text-[#00ffff]"
          >
            {isSignUp ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up'}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#ff00ff] to-[#00ffff] p-4">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-900 rounded-l-lg shadow-lg overflow-hidden flex flex-col"
      >
        <div className="p-4 bg-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Channels</h2>
          {user?.isAdmin && (
            <Button onClick={() => setShowAdminPanel(!showAdminPanel)} size="sm" className="bg-[#00ffff] hover:bg-[#00cccc] text-gray-900">
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
        {showAdminPanel && <AdminPanel />}
        <ScrollArea className="flex-grow">
          <Tabs value={currentChannel?.toString()} className="w-full" orientation="vertical">
            <TabsList className="bg-gray-900 h-auto flex flex-col items-stretch p-0">
              {channels.map((channel) => (
                <TabsTrigger
                  key={channel.id}
                  value={channel.id.toString()}
                  onClick={() => setCurrentChannel(channel.id)}
                  className="justify-start px-4 py-2 text-left hover:bg-gray-800"
                >
                  # {channel.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </ScrollArea>
        <div className="p-4 bg-gray-800 flex items-center">
          <UserCircle className="w-8 h-8 text-[#00ffff] mr-2" />
          <span className="text-white font-semibold">{user?.username}</span>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="ml-auto text-gray-400 hover:text-white">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow bg-gray-900 rounded-r-lg shadow-lg overflow-hidden flex flex-col"
      >
        <div className="bg-gray-800 p-4">
          <h2 className="text-xl font-bold text-white">#{channels.find(c => c.id === currentChannel)?.name}</h2>
        </div>
        <ScrollArea className="flex-grow p-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <div className="flex items-baseline">
                <span className="font-semibold text-[#00ffff] mr-2">{message.user.username}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {message.type === 'text' && (
                <p className="text-gray-200">{message.content}</p>
              )}
              {message.type === 'image' && (
                <img src={message.content} alt="User uploaded image" className="max-w-xs max-h-48 object-contain" />
              )}
              {message.type === 'audio' && (
                <audio controls src={message.content} className="max-w-xs" />
              )}
              {message.type === 'link' && (
                <a href={message.content} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {message.content}
                </a>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 flex space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow bg-gray-700 text-white border-gray-600 focus:ring-[#ff00ff] focus:border-[#ff00ff]"
          />
          <Button type="submit" className="bg-[#00ffff] hover:bg-[#00cccc] text-gray-900">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <Button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#00ffff] hover:bg-[#00cccc] text-gray-900">
            <Image className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={() => audioInputRef.current?.click()} className="bg-[#00ffff] hover:bg-[#00cccc] text-gray-900">
            <Mic className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={handleLinkSubmit} className="bg-[#00ffff] hover:bg-[#00cccc] text-gray-900">
            <Link className="w-4 h-4" />
          </Button>
        </form>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={audioInputRef}
          onChange={handleAudioUpload}
          accept="audio/*"
          style={{ display: 'none' }}
        />
      </motion.div>
    </div>
  )
}