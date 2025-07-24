import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Loader,
  Minimize2,
  Maximize2,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { aiChatService } from '../../services/AIChatService';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { errorContext } from '../../utils/errorContext';

const AIChatWidget = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when chat opens
  useEffect(() => {
    if (isOpen && !conversation) {
      initializeChat();
    }
  }, [isOpen]);

  // Check if we should auto-open the chat (e.g., after an error)
  useEffect(() => {
    const shouldOpenChat = sessionStorage.getItem('open_ai_chat_on_load');
    const initialMessage = sessionStorage.getItem('ai_chat_initial_message');
    
    if (shouldOpenChat === 'true') {
      sessionStorage.removeItem('open_ai_chat_on_load');
      sessionStorage.removeItem('ai_chat_initial_message');
      
      setIsOpen(true);
      
      // Wait for chat to initialize then send the message
      setTimeout(() => {
        if (initialMessage) {
          setInputValue(initialMessage);
          // Auto-send after another short delay
          setTimeout(() => {
            const sendButton = document.querySelector('[data-chat-send-button]');
            if (sendButton) sendButton.click();
          }, 500);
        }
      }, 1000);
    }
  }, []);

  // Initialize chat conversation
  const initializeChat = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const conv = await aiChatService.initializeConversation(currentUser?.id);
      setConversation(conv);
      
      // Load message history
      const history = await aiChatService.loadMessageHistory();
      setMessages(history);
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError('Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsTyping(true);
    setError(null);

    // Add user message to UI immediately
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      // Get context for AI
      const context = {
        currentPage: location.pathname,
        isAuthenticated: !!currentUser,
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        recentError: errorContext.formatForAI()
      };

      // Send to AI service
      const response = await aiChatService.sendMessage(userMessage, context);
      
      // Update messages with the response
      setMessages(prev => {
        // Remove temporary message and add real ones
        const filtered = prev.filter(m => m.id !== tempUserMessage.id);
        return [...filtered, response];
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  // Handle feedback
  const handleFeedback = async (messageId, feedbackType) => {
    try {
      await aiChatService.submitFeedback(
        messageId,
        feedbackType,
        null,
        null,
        currentUser?.id
      );
      
      // Update UI to show feedback was recorded
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, userFeedback: feedbackType }
          : msg
      ));
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: "How to add funds?", action: "How do I add funds to my wallet?" },
    { label: "Create a group", action: "How do I create a new group?" },
    { label: "Report a bug", action: "I want to report a bug" },
    { label: "Get help", action: "I need help with something" }
  ];

  // Handle quick action
  const handleQuickAction = (action) => {
    setInputValue(action);
    sendMessage();
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow group"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              AI
            </span>
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Need help? Chat with AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold">Bankroll AI Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (conversation) {
                      aiChatService.closeConversation();
                    }
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                  ) : error && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                      <p className="text-red-600">{error}</p>
                      <button
                        onClick={initializeChat}
                        className="mt-2 text-purple-600 hover:text-purple-700"
                      >
                        Try again
                      </button>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role !== 'user' && (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Bot className="w-5 h-5 text-purple-600" />
                              </div>
                            </div>
                          )}
                          
                          <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                            <div
                              className={`p-3 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-purple-600 text-white'
                                  : message.role === 'error'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            
                            {/* Timestamp and feedback */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </span>
                              
                              {message.role === 'assistant' && !message.userFeedback && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleFeedback(message.id, 'helpful')}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                    title="Helpful"
                                  >
                                    <ThumbsUp className="w-3 h-3 text-gray-500" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(message.id, 'not_helpful')}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                    title="Not helpful"
                                  >
                                    <ThumbsDown className="w-3 h-3 text-gray-500" />
                                  </button>
                                </div>
                              )}
                              
                              {message.userFeedback && (
                                <span className="text-xs text-gray-500">
                                  Thanks for feedback!
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {message.role === 'user' && (
                            <div className="flex-shrink-0 order-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Quick Actions - Show only at start */}
                {messages.length <= 1 && !isLoading && (
                  <div className="px-4 pb-2">
                    <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.action)}
                          className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t dark:border-gray-700">
                  {error && (
                    <div className="mb-2 p-2 bg-red-100 text-red-600 text-xs rounded">
                      {error}
                    </div>
                  )}
                  
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isLoading || isTyping}
                      className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading || isTyping}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      data-chat-send-button
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Powered by Claude AI • <button 
                      onClick={() => {
                        if (window.confirm('Do you need human support? This will escalate your conversation to our support team.')) {
                          aiChatService.escalateToSupport('User requested human support', currentUser?.id);
                          setInputValue('');
                          setMessages(prev => [...prev, {
                            id: `system-${Date.now()}`,
                            role: 'system',
                            content: 'Your conversation has been escalated to our support team. They will reach out to you via email soon.',
                            created_at: new Date().toISOString()
                          }]);
                        }
                      }}
                      className="text-purple-600 hover:underline"
                    >
                      Contact human support
                    </button>
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;