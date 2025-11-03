"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  Send,
  Paperclip,
  Search,
  MoreVertical,
  CheckCheck,
  Check,
  Phone,
  Video,
} from "lucide-react"

// Mock data for conversations
const conversations = [
  {
    id: 1,
    providerId: 1,
    providerName: "Sunshine Daycare Center",
    providerImage: "/bright-colorful-daycare-center-exterior.jpg",
    lastMessage: "Thank you for your application! We'd love to schedule a tour with you.",
    lastMessageTime: "2 hours ago",
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: 1,
        senderId: "provider",
        senderName: "Sarah Johnson",
        content:
          "Hi! Thank you for submitting your application for Emma. We're excited to potentially welcome your family to Sunshine Daycare.",
        timestamp: "2024-01-15T10:30:00Z",
        isRead: true,
      },
      {
        id: 2,
        senderId: "parent",
        senderName: "You",
        content: "Thank you! We're very interested. Could you tell me more about your daily schedule and activities?",
        timestamp: "2024-01-15T11:15:00Z",
        isRead: true,
      },
      {
        id: 3,
        senderId: "provider",
        senderName: "Sarah Johnson",
        content:
          "Of course! We follow a structured daily routine with circle time, outdoor play, arts and crafts, and educational activities. I can send you our detailed schedule.",
        timestamp: "2024-01-15T11:45:00Z",
        isRead: true,
      },
      {
        id: 4,
        senderId: "provider",
        senderName: "Sarah Johnson",
        content: "Thank you for your application! We'd love to schedule a tour with you.",
        timestamp: "2024-01-15T14:20:00Z",
        isRead: false,
      },
    ],
  },
  {
    id: 2,
    providerId: 2,
    providerName: "Little Learners Home Care",
    providerImage: "/cozy-home-daycare-with-children-playing.jpg",
    lastMessage: "I have an opening starting next month. Would you like to discuss?",
    lastMessageTime: "1 day ago",
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 1,
        senderId: "provider",
        senderName: "Maria Garcia",
        content:
          "Hello! I received your application and I'm impressed with Emma's profile. I have an opening starting next month. Would you like to discuss?",
        timestamp: "2024-01-14T09:00:00Z",
        isRead: true,
      },
      {
        id: 2,
        senderId: "parent",
        senderName: "You",
        content: "That sounds perfect! What would be the next steps?",
        timestamp: "2024-01-14T09:30:00Z",
        isRead: true,
      },
    ],
  },
  {
    id: 3,
    providerId: 3,
    providerName: "Rainbow Kids Academy",
    providerImage: "/modern-daycare-center-with-playground.jpg",
    lastMessage: "We have a waitlist spot available. Are you still interested?",
    lastMessageTime: "3 days ago",
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: 1,
        senderId: "provider",
        senderName: "Jennifer Smith",
        content: "We have a waitlist spot available. Are you still interested?",
        timestamp: "2024-01-12T16:00:00Z",
        isRead: false,
      },
    ],
  },
]

export default function MessagesPage() {
  // Simulate login state for demo (replace with real auth in production)
  const router = useRouter();
  const [user, setUser] = useState<{email: string, name: string} | null>(
    typeof window !== 'undefined' && window.localStorage.getItem('user')
      ? JSON.parse(window.localStorage.getItem('user')!)
      : null
  );
  const [authChecked, setAuthChecked] = useState(false);
  // Mark auth checked on mount (hydration-safe display)
  useEffect(() => {
    setAuthChecked(true);
  }, []);
  function handleLogout() {
    setUser(null);
    if (typeof window !== 'undefined') window.localStorage.removeItem('user');
    router.push("/");
  }
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.providerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: selectedConversation.messages.length + 1,
      senderId: "parent",
      senderName: "You",
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
    }

    // Update the conversation with the new message
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      lastMessageTime: "Just now",
    }

    setSelectedConversation(updatedConversation)
    setNewMessage("")
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Header */}
  <nav className="border-b bg-white shadow-sm">
  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/search")}> 
            <img src="/CareLink%20logo4.png" alt="CareLink" className="h-8 w-auto" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder-logo.png'}} />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-primary focus:ring-2 focus:ring-primary"><Link href="/profile">Edit Profile</Link></Button>
            {user && (
              <Button variant="outline" onClick={handleLogout} className="border-primary text-primary focus:ring-2 focus:ring-primary">Logout</Button>
            )}
          </div>
        </div>
      </nav>

  <main className="container mx-auto px-4 py-6">
  {authChecked && !user && (
    <div className="max-w-xl mx-auto text-center p-6 border rounded-lg bg-white shadow-sm">
      <p className="mb-4">请先登录以查看消息。</p>
      <Button onClick={() => router.push('/login')}>前往登录</Button>
    </div>
  )}
  <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col bg-white ring-1 ring-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary">Conversations</CardTitle>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">{conversations.length}</Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-primary" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-primary"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                  <div className="space-y-1 p-4 pt-0">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation.id === conversation.id
                            ? "bg-primary/20 border-2 border-primary"
                            : "hover:bg-primary/10 border border-primary/10"
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={conversation.providerImage || "/placeholder.svg"} />
                              <AvatarFallback>{conversation.providerName[0]}</AvatarFallback>
                            </Avatar>
                            {conversation.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-sm truncate">{conversation.providerName}</h3>
                              <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="mt-2 h-5 px-2 text-xs bg-primary text-primary-foreground">{conversation.unreadCount} new</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col bg-white ring-1 ring-gray-100 shadow-sm">
              {/* Chat Header */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedConversation.providerImage || "/placeholder.svg"} />
                        <AvatarFallback>{selectedConversation.providerName[0]}</AvatarFallback>
                      </Avatar>
                      {selectedConversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{selectedConversation.providerName}</h3>
                      <p className="text-sm text-primary/80">
                        {selectedConversation.isOnline ? "Online now" : "Last seen 2 hours ago"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-primary focus:ring-2 focus:ring-primary">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-primary focus:ring-2 focus:ring-primary">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-primary focus:ring-2 focus:ring-primary">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-4">
                  <div className="space-y-4 py-4">
                    {selectedConversation.messages.map((message, index) => {
                      const showDate =
                        index === 0 ||
                        formatDate(message.timestamp) !== formatDate(selectedConversation.messages[index - 1].timestamp)

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex ${message.senderId === "parent" ? "justify-end" : "justify-start"} mb-2`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                message.senderId === "parent"
                                  ? "bg-primary text-primary-foreground focus:ring-2 focus:ring-primary"
                                  : "bg-background/80 text-foreground border border-primary/10"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div
                                className={`flex items-center justify-end space-x-1 mt-1 ${
                                  message.senderId === "parent" ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-xs">{formatTime(message.timestamp)}</span>
                                {message.senderId === "parent" && (
                                  <div className="flex">
                                    {message.isRead ? (
                                      <CheckCheck className="w-3 h-3" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="text-primary focus:ring-2 focus:ring-primary">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="pr-12"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="absolute right-1 top-1 h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-primary mt-2 flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Secure messaging - Your conversations are private and encrypted
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
