'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { EmojiPicker } from '@/components/EmojiPicker'
import { AnimatedBackground } from '@/components/AnimatedBackground'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    email: string
    profile?: {
      firstName: string
      lastName: string
    }
  }
}

export default function ConversationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState<{ id: string; email: string; idVerified?: boolean; profile?: { firstName: string; lastName: string } } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messaging/conversation/${userId}`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages || [])
        if (data.otherUser) {
          setOtherUser(data.otherUser)
        }
      } else if (response.status === 404) {
        router.push('/messaging')
      } else {
        console.error('Error response:', data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, router])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchMessages()
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [status, router, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    const messageContent = newMessage
    setNewMessage('')

    try {
      const response = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: userId,
          content: messageContent,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchMessages()
        if (data.blockedContent) {
          alert('Some personal information was removed from your message for security reasons.')
        }
      } else {
        alert(data.error || 'Failed to send message')
        setNewMessage(messageContent)
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-iosBg-secondary flex items-center justify-center safe-top safe-bottom">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-iosBlue mb-4"></div>
          <p className="text-ios-body text-iosGray-1">Loading conversation...</p>
        </div>
      </div>
    )
  }

  const otherUserName = otherUser?.profile 
    ? `${otherUser.profile.firstName} ${otherUser.profile.lastName}`
    : otherUser?.email || 'User'
  
  const otherUserInitial = otherUserName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col safe-top safe-bottom relative">
      <AnimatedBackground intensity="minimal" />
      <div className="relative z-10 flex flex-col flex-1">
      {/* Elegant Header - Matrimonial Theme */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 safe-top sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 ios-press rounded-xl text-gray-600 hover:bg-gray-100"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-iosBlue flex items-center justify-center text-white font-semibold flex-shrink-0">
          {otherUserInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{otherUserName}</h1>
            {otherUser?.idVerified ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold border border-green-200">
                ✓ Verified ID
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-200">
                Not verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">Active now</p>
        </div>
        <button className="p-2 ios-press rounded-xl text-gray-600 hover:bg-gray-100" aria-label="More options">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages Area - Elegant Background */}
      <div 
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-3 ios-scroll bg-gradient-to-b from-gray-50 to-white"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <div className="text-center px-4">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-base text-gray-600">No messages yet</p>
              <p className="text-sm text-gray-500 mt-2">Start the conversation! 👋</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === session?.user?.id
            const messageTime = new Date(message.createdAt)
            const isToday = messageTime.toDateString() === new Date().toDateString()
            const timeString = isToday 
              ? messageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
              : messageTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
                messageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            
            // Check if we should show avatar (first message or different sender than previous)
            const prevMessage = index > 0 ? messages[index - 1] : null
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end gap-2 sm:gap-3 ${showAvatar ? 'mt-3' : 'mt-1'}`}
              >
                {!isOwnMessage && (
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-iosBlue flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                    {otherUserInitial}
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-md px-4 py-2.5 rounded-2xl shadow-md ${
                    isOwnMessage
                      ? 'bg-iosBlue text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>
                    <span className="text-xs">{timeString}</span>
                    {isOwnMessage && (
                      <span className="text-xs ml-0.5">
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
                {isOwnMessage && (
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                    {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Elegant Design */}
      <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 safe-bottom">
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 min-h-[44px]">
            <EmojiPicker
              onEmojiSelect={(emoji) => setNewMessage(prev => prev + emoji)}
              className="flex-shrink-0"
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-0 outline-none text-sm sm:text-base text-gray-900 placeholder-gray-400"
              disabled={sending}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (newMessage.trim()) {
                    handleSend(e as any)
                  }
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="w-11 h-11 sm:w-12 sm:h-12 bg-iosBlue text-white rounded-full flex items-center justify-center ios-press disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:bg-iosBlue-dark transition-colors"
            aria-label="Send message"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 px-2 text-center">
          <strong>Privacy:</strong> Personal contact info will be filtered for your safety.
        </p>
      </div>
      </div>
    </div>
  )
}