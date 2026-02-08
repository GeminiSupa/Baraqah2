'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/AnimatedBackground'

interface Question {
  question: string
  answer?: string | null
}

interface Questionnaire {
  id: string
  requestId: string
  senderId: string
  receiverId: string
  questions: Question[]
  status: string
  createdAt: string
  updatedAt: string
}

interface MessageRequest {
  id: string
  status: string
  connectionStatus: string
  sender?: {
    id: string
    profile?: {
      firstName: string
      lastName: string
    }
  }
  receiver?: {
    id: string
    profile?: {
      firstName: string
      lastName: string
    }
  }
}

export default function QuestionnairePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const requestId = params.requestId as string
  const [request, setRequest] = useState<MessageRequest | null>(null)
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newQuestions, setNewQuestions] = useState<string[]>([''])
  const [answers, setAnswers] = useState<string[]>([])
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      // Fetch request info
      const requestResponse = await fetch(`/api/messaging/requests?type=received`)
      const requestData = await requestResponse.json()
      const foundRequest = requestData.requests?.find((r: MessageRequest) => r.id === requestId)
      
      if (!foundRequest) {
        // Try sent requests
        const sentResponse = await fetch(`/api/messaging/requests?type=sent`)
        const sentData = await sentResponse.json()
        const foundSent = sentData.requests?.find((r: MessageRequest) => r.id === requestId)
        if (foundSent) {
          setRequest(foundSent)
        }
      } else {
        setRequest(foundRequest)
      }

      // Fetch questionnaires
      const response = await fetch(`/api/questionnaire/${requestId}`)
      const data = await response.json()

      if (response.ok) {
        setQuestionnaires(data.questionnaires || [])
        
        // If there's a questionnaire to answer, initialize answers
        const toAnswer = data.questionnaires?.find((q: Questionnaire) => 
          q.receiverId === session?.user?.id && q.status === 'pending'
        )
        if (toAnswer) {
          setAnswers(new Array(toAnswer.questions.length).fill(''))
        }
      } else {
        // If error, show it but don't block the page
        if (data.error && !data.error.includes('must be accepted')) {
          setError(data.error)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [requestId, session?.user?.id])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router, fetchData])

  const handleAddQuestion = () => {
    if (newQuestions.length < 10) {
      setNewQuestions([...newQuestions, ''])
    }
  }

  const handleRemoveQuestion = (index: number) => {
    setNewQuestions(newQuestions.filter((_, i) => i !== index))
  }

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...newQuestions]
    updated[index] = value
    setNewQuestions(updated)
  }

  const handleSubmitQuestions = async () => {
    const validQuestions = newQuestions.filter(q => q.trim().length > 0)
    
    if (validQuestions.length === 0) {
      setError('Please add at least one question')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await fetch(`/api/questionnaire/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: validQuestions.map(q => ({ question: q })),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowCreateForm(false)
        setNewQuestions([''])
        fetchData()
      } else {
        setError(data.error || 'Failed to send questions')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...answers]
    updated[index] = value
    setAnswers(updated)
  }

  const handleSubmitAnswers = async () => {
    const questionnaireToAnswer = questionnaires.find(q => 
      q.receiverId === session?.user?.id && q.status === 'pending'
    )

    if (!questionnaireToAnswer) {
      setError('No questionnaire to answer')
      return
    }

    if (answers.some(a => !a.trim())) {
      setError('Please answer all questions')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await fetch(`/api/questionnaire/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionnaireId: questionnaireToAnswer.id,
          answers,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchData()
      } else {
        setError(data.error || 'Failed to submit answers')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkViewed = async () => {
    // This will be handled when connecting
    router.push(`/messaging/connect/${requestId}`)
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600">{error || 'Request not found'}</p>
            <Link href="/messaging" className="mt-4 text-primary-600 hover:text-primary-700">
              Back to Messages
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const otherUser = request.sender?.id === session?.user?.id ? request.receiver : request.sender
  const otherUserName = otherUser?.profile 
    ? `${otherUser.profile.firstName} ${otherUser.profile.lastName}`
    : 'User'

  const myQuestionnaire = questionnaires.find(q => q.senderId === session?.user?.id)
  const theirQuestionnaire = questionnaires.find(q => q.receiverId === session?.user?.id)
  const hasPendingQuestions = theirQuestionnaire && theirQuestionnaire.status === 'pending'
  const myQuestionnaireAnswered = myQuestionnaire?.status === 'answered'
  const theirQuestionnaireAnswered = theirQuestionnaire?.status === 'answered'
  // If connection status is questionnaire_completed, both are done - allow connection
  const canConnect = request.connectionStatus === 'questionnaire_completed' || 
                     (myQuestionnaireAnswered && theirQuestionnaireAnswered)
  
  // Determine what the user can do next
  const canSendQuestions = !myQuestionnaire && request.connectionStatus === 'accepted'
  const canAnswerQuestions = hasPendingQuestions && !theirQuestionnaireAnswered
  const waitingForTheirAnswer = myQuestionnaire && myQuestionnaire.status === 'pending'
  const waitingForMyAnswer = theirQuestionnaire && theirQuestionnaire.status === 'pending' && !theirQuestionnaireAnswered

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 safe-top safe-bottom pb-24 md:pb-12 relative">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto">
        {/* Mobile Back Button */}
        <button
          onClick={() => router.back()}
          className="md:hidden mb-4 flex items-center text-gray-700 hover:text-gray-900 ios-press"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-base font-medium">Back</span>
        </button>
        
        <div className="mb-6 hidden md:block">
          <Link href="/messaging" className="text-primary-600 hover:text-primary-700">
            ← Back to Messages
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Custom Questionnaire with {otherUserName}
          </h1>

          {/* Status */}
          <div className={`mb-6 p-4 rounded-lg ${
            hasPendingQuestions 
              ? 'bg-orange-50 border-2 border-orange-400' 
              : request.connectionStatus === 'questionnaire_completed'
              ? 'bg-green-50'
              : 'bg-blue-50'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                <strong>Status:</strong> {request.connectionStatus.replace('_', ' ').toUpperCase()}
              </p>
              {hasPendingQuestions && (
                <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold animate-pulse">
                  New Questions!
                </span>
              )}
            </div>
          </div>

          {/* Create Questions Form */}
          {!myQuestionnaire && request.connectionStatus === 'accepted' && (
            <div className="mb-8">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Send Custom Questions to {otherUserName}
                </button>
              ) : (
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Create Your Questions
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Ask up to 10 custom questions (one per line). These will help you get to know {otherUserName} better.
                  </p>
                  
                  <div className="space-y-4">
                    {newQuestions.map((question, index) => (
                      <div key={index} className="flex space-x-2">
                        <textarea
                          value={question}
                          onChange={(e) => handleQuestionChange(index, e.target.value)}
                          placeholder={`Question ${index + 1}`}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        />
                        {newQuestions.length > 1 && (
                          <button
                            onClick={() => handleRemoveQuestion(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {newQuestions.length < 10 && (
                    <button
                      onClick={handleAddQuestion}
                      className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      + Add Another Question
                    </button>
                  )}

                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewQuestions([''])
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitQuestions}
                      disabled={processing}
                      className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                    >
                      {processing ? 'Sending...' : 'Send Questions'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Answer Questions */}
          {theirQuestionnaire && theirQuestionnaire.status === 'pending' && (
            <div className="mb-8 border-2 border-orange-400 rounded-lg p-6 bg-orange-50">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">📩</span>
                <h2 className="text-xl font-semibold text-gray-900">
                  Questions from {otherUserName}
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Please answer these questions to continue the connection process.
              </p>
              <div className="space-y-4">
                {theirQuestionnaire.questions.map((q, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {index + 1}. {q.question}
                    </label>
                    <textarea
                      value={answers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Your answer..."
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmitAnswers}
                disabled={processing || answers.some(a => !a.trim())}
                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {processing ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          )}

          {/* View Answers - Show individually when answered */}
          {(myQuestionnaireAnswered || theirQuestionnaireAnswered) && (
            <div className="space-y-8">
              {/* My Questions and Their Answers */}
              {myQuestionnaireAnswered && (
                <div className="border-2 border-iosBlue rounded-ios-lg p-6 bg-blue-50/50">
                  <h2 className="text-ios-title2 font-semibold text-gray-900 mb-4">
                    Your Questions & {otherUserName}&apos;s Answers
                  </h2>
                  <div className="space-y-4">
                    {myQuestionnaire.questions.map((q, index) => (
                      <div key={index} className="border-l-4 border-iosBlue pl-4 py-2 bg-white rounded-ios p-3">
                        <p className="font-semibold text-gray-900 mb-2 text-ios-body">{q.question}</p>
                        <p className="text-gray-700 whitespace-pre-wrap text-ios-body leading-relaxed">
                          {q.answer || 'No answer provided'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Their Questions and My Answers */}
              {theirQuestionnaireAnswered && (
                <div className="border-2 border-iosGreen rounded-ios-lg p-6 bg-green-50/50">
                  <h2 className="text-ios-title2 font-semibold text-gray-900 mb-4">
                    {otherUserName}&apos;s Questions & Your Answers
                  </h2>
                  <div className="space-y-4">
                    {theirQuestionnaire.questions.map((q, index) => (
                      <div key={index} className="border-l-4 border-iosGreen pl-4 py-2 bg-white rounded-ios p-3">
                        <p className="font-semibold text-gray-900 mb-2 text-ios-body">{q.question}</p>
                        <p className="text-gray-700 whitespace-pre-wrap text-ios-body leading-relaxed">
                          {q.answer || 'No answer provided'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connect Button - Show when status is completed OR both are answered OR user has answered questions sent to them */}
              {(request.connectionStatus === 'questionnaire_completed' || canConnect || (theirQuestionnaireAnswered && !hasPendingQuestions)) && (
                <div className="space-y-4 pt-4">
                  {request.connectionStatus === 'questionnaire_completed' || canConnect ? (
                    <div className="space-y-4">
                      <p className="text-ios-body text-green-600 font-semibold mb-2 text-center">
                        ✅ Questionnaires Completed!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                          href={`/messaging/connect/${requestId}`}
                          className="inline-block px-8 py-4 bg-iosBlue text-white rounded-ios-lg hover:bg-iosBlue-dark text-ios-title3 font-semibold ios-press shadow-ios-lg text-center"
                        >
                          Connect & Start Messaging
                        </Link>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-8 py-4 bg-iosRed text-white rounded-ios-lg hover:bg-iosRed-dark text-ios-title3 font-semibold ios-press shadow-ios-lg"
                        >
                          Reject Connection
                        </button>
                      </div>
                      <p className="text-ios-footnote text-iosGray-1 mt-2 text-center">
                        Or <Link href={`/messaging/${otherUser?.id}`} className="text-iosBlue underline">start messaging directly</Link>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-ios-body text-iosGray-1 mb-4 text-center">
                        ✅ You&apos;ve answered their questions! You can now start messaging.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                          href={`/messaging/${otherUser?.id}`}
                          className="inline-block px-8 py-4 bg-iosBlue text-white rounded-ios-lg hover:bg-iosBlue-dark text-ios-title3 font-semibold ios-press shadow-ios-lg text-center"
                        >
                          Start Messaging
                        </Link>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-8 py-4 bg-iosRed text-white rounded-ios-lg hover:bg-iosRed-dark text-ios-title3 font-semibold ios-press shadow-ios-lg"
                        >
                          Reject Connection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Waiting message - Show clear next steps (only if not completed) */}
              {request.connectionStatus !== 'questionnaire_completed' && !canConnect && (
                <div className="text-center py-4 bg-iosGray-6 rounded-ios-lg">
                  <p className="text-ios-body text-iosGray-1">
                    {/* Priority 1: If they sent questions and I haven't answered - show this first */}
                    {hasPendingQuestions && !theirQuestionnaireAnswered
                      ? `📩 ${otherUserName} sent you questions! Please scroll up to answer them.`
                      /* Priority 2: If I sent questions and they haven't answered yet */
                      : myQuestionnaire && myQuestionnaire.status === 'pending' && !myQuestionnaireAnswered
                      ? `⏳ Waiting for ${otherUserName} to answer your questions...`
                      /* Priority 3: If I answered their questions but they haven't answered mine yet */
                      : theirQuestionnaireAnswered && myQuestionnaire && myQuestionnaire.status === 'pending'
                      ? `✅ You answered their questions! Waiting for ${otherUserName} to answer yours...`
                      /* Priority 4: If they answered my questions but I haven't answered theirs */
                      : myQuestionnaireAnswered && theirQuestionnaire && theirQuestionnaire.status === 'pending'
                      ? `✅ They answered your questions! Please answer their questions above to complete the process.`
                      /* Priority 5: Both answered but connection status not updated yet */
                      : myQuestionnaireAnswered && theirQuestionnaireAnswered
                      ? '✅ Both questionnaires completed! The connect button should appear above shortly.'
                      /* Default: No questionnaires sent yet */
                      : !myQuestionnaire && !theirQuestionnaire
                      ? 'You can send questions to get to know each other better.'
                      /* Fallback */
                      : 'Complete the questionnaires to proceed.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Waiting State - Show only when no questionnaires exist or questions are pending */}
          {request.connectionStatus === 'questionnaire_sent' && myQuestionnaire && myQuestionnaire.status === 'pending' && !theirQuestionnaire && (
            <div className="text-center py-8 bg-iosGray-6 rounded-ios-lg">
              <p className="text-ios-body text-iosGray-1">
                Waiting for {otherUserName} to answer your questions...
              </p>
            </div>
          )}

          {request.connectionStatus === 'accepted' && !myQuestionnaire && !theirQuestionnaire && (
            <div className="text-center py-8 bg-blue-50 rounded-ios-lg p-6">
              <p className="text-ios-body text-gray-700">
                You can now send custom questions to {otherUserName} to get to know them better.
              </p>
            </div>
          )}
          
          {/* Show message if they sent questions but I haven't answered */}
          {theirQuestionnaire && theirQuestionnaire.status === 'pending' && !hasPendingQuestions && (
            <div className="text-center py-8 bg-orange-50 rounded-ios-lg p-6 border-2 border-orange-400">
              <p className="text-ios-body text-gray-700 font-semibold">
                {otherUserName} sent you questions! Please answer them above.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ios-blur" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-ios-xl p-6 max-w-md w-full mx-4 shadow-ios-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-ios-title2 font-semibold text-gray-900 mb-4">Reject Connection</h2>
            <p className="text-ios-body text-iosGray-1 mb-4">
              Please provide a reason for rejecting this connection. This will help us improve our matching process.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter your reason (optional but recommended)..."
              rows={4}
              className="w-full px-4 py-3 rounded-ios border border-iosGray-4 focus:outline-none focus:ring-2 focus:ring-iosRed focus:border-iosRed mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setRejecting(true)
                  try {
                    const response = await fetch(`/api/messaging/request/${requestId}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        status: 'rejected',
                        connectionStatus: 'rejected',
                        rejectionReason: rejectReason || 'No reason provided',
                      }),
                    })

                    if (response.ok) {
                      router.push('/messaging')
                    } else {
                      const data = await response.json()
                      setError(data.error || 'Failed to reject connection')
                      setShowRejectModal(false)
                    }
                  } catch (error) {
                    setError('An error occurred. Please try again.')
                    setShowRejectModal(false)
                  } finally {
                    setRejecting(false)
                  }
                }}
                disabled={rejecting}
                className="flex-1 px-6 py-3 bg-iosRed text-white rounded-ios-lg hover:bg-iosRed-dark font-semibold ios-press disabled:opacity-50"
              >
                {rejecting ? 'Rejecting...' : 'Reject Connection'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                disabled={rejecting}
                className="flex-1 px-6 py-3 bg-iosGray-6 text-iosGray-1 rounded-ios-lg hover:bg-iosGray-5 font-semibold ios-press disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
