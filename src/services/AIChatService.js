import { supabase } from './supabase/client';
import { v4 as uuidv4 } from 'uuid';

class AIChatService {
  constructor() {
    this.conversationId = null;
    this.sessionId = this.getOrCreateSessionId();
    this.messageHistory = [];
    this.claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';
  }

  // Get or create a session ID for anonymous users
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('ai_chat_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('ai_chat_session_id', sessionId);
    }
    return sessionId;
  }

  // Initialize or get existing conversation
  async initializeConversation(userId = null) {
    try {
      // Check for existing active conversation
      const { data: existingConversation } = await supabase
        .from('ai_chat_conversations')
        .select('*')
        .eq('status', 'active')
        .eq(userId ? 'user_id' : 'session_id', userId || this.sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingConversation) {
        this.conversationId = existingConversation.id;
        await this.loadMessageHistory();
        return existingConversation;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('ai_chat_conversations')
        .insert({
          user_id: userId,
          session_id: this.sessionId,
          status: 'active',
          metadata: {
            user_agent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        })
        .select()
        .single();

      if (error) throw error;

      this.conversationId = newConversation.id;
      
      // Send initial greeting
      await this.addMessage('assistant', this.getGreetingMessage());
      
      return newConversation;
    } catch (error) {
      console.error('Error initializing conversation:', error);
      throw error;
    }
  }

  // Load message history for current conversation
  async loadMessageHistory() {
    if (!this.conversationId) return;

    try {
      const { data: messages, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('conversation_id', this.conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      this.messageHistory = messages || [];
      return messages;
    } catch (error) {
      console.error('Error loading message history:', error);
      return [];
    }
  }

  // Add a message to the conversation
  async addMessage(role, content, metadata = {}) {
    if (!this.conversationId) {
      throw new Error('No active conversation');
    }

    try {
      const { data: message, error } = await supabase
        .from('ai_chat_messages')
        .insert({
          conversation_id: this.conversationId,
          role,
          content,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      this.messageHistory.push(message);
      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  // Send message to Claude and get response
  async sendMessage(userMessage, context = {}) {
    try {
      // Add user message to conversation
      await this.addMessage('user', userMessage, { context });

      // Search knowledge base first
      const knowledgeBaseResponse = await this.searchKnowledgeBase(userMessage);
      
      // Prepare context for Claude
      const systemPrompt = this.buildSystemPrompt(context, knowledgeBaseResponse);
      
      // Get Claude's response
      const assistantResponse = await this.callClaudeAPI(userMessage, systemPrompt);
      
      // Add assistant response to conversation
      const message = await this.addMessage('assistant', assistantResponse, {
        knowledge_base_used: knowledgeBaseResponse.length > 0
      });

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to conversation
      const errorMessage = "I apologize, but I'm having trouble processing your request right now. Please try again or contact support at support@bankroll.live.";
      await this.addMessage('error', errorMessage, { error: error.message });
      
      throw error;
    }
  }

  // Search the knowledge base for relevant answers
  async searchKnowledgeBase(query) {
    try {
      const { data, error } = await supabase
        .rpc('search_knowledge_base', { search_query: query });

      if (error) throw error;

      // Update usage count for used answers
      if (data && data.length > 0) {
        const topResult = data[0];
        await supabase
          .from('ai_knowledge_base')
          .update({ usage_count: topResult.usage_count + 1 })
          .eq('id', topResult.id);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  // Build system prompt for Claude
  buildSystemPrompt(context, knowledgeBaseResults) {
    let systemPrompt = `You are a helpful AI assistant for Bankroll, a financial app that helps users manage group finances, sports betting bankrolls, and peer-to-peer transactions. 

Your role is to:
1. Help users navigate the app and understand its features
2. Assist with troubleshooting technical issues
3. Explain how features work (wallet, groups, rewards, referrals)
4. Collect bug reports with relevant details
5. Escalate to human support when needed

Key features of Bankroll:
- Wallet: Add funds via ACH/debit/wire, withdraw to bank, view transaction history
- Groups: Create and manage group bankrolls, invite members, track contributions
- Rewards: Daily spin for bonus funds, referral program with commission
- Partners: Integrated sportsbook platforms with special offers

Guidelines:
- Be concise and friendly
- Use bullet points for step-by-step instructions
- Ask clarifying questions when needed
- If you don't know something, admit it and offer to connect them with support
- For bugs/errors, collect: what they were doing, error message, browser/device info
- Never provide financial advice or guarantee outcomes
- Direct payment/security issues to support@bankroll.live

Current context:
- Page: ${context.currentPage || 'Unknown'}
- User authenticated: ${context.isAuthenticated || false}
- Time: ${new Date().toLocaleString()}`;

    if (knowledgeBaseResults.length > 0) {
      systemPrompt += `\n\nRelevant information from knowledge base:\n`;
      knowledgeBaseResults.forEach((kb, index) => {
        systemPrompt += `\n${index + 1}. Q: ${kb.question}\n   A: ${kb.answer}\n`;
      });
    }

    if (context.recentError) {
      systemPrompt += `\n\nThe user recently encountered an error:\n${context.recentError}`;
    }

    return systemPrompt;
  }

  // Call Claude API
  async callClaudeAPI(userMessage, systemPrompt) {
    // Check if we have knowledge base results that directly answer the question
    const kbResults = await this.searchKnowledgeBase(userMessage);
    if (kbResults.length > 0 && kbResults[0].relevance > 8) {
      return kbResults[0].answer;
    }

    // If no API key is configured, use intelligent fallback responses
    if (!this.claudeApiKey || this.claudeApiKey === '') {
      return this.getIntelligentFallbackResponse(userMessage, systemPrompt, kbResults);
    }

    // Actual Claude API implementation
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          system: systemPrompt,
          messages: [
            ...this.messageHistory.slice(-10).map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Claude API error:', error);
        throw new Error('Claude API error');
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API error:', error);
      // Fall back to intelligent response on API error
      return this.getIntelligentFallbackResponse(userMessage, systemPrompt, kbResults);
    }
  }

  // Get intelligent fallback response when Claude API is not available
  getIntelligentFallbackResponse(userMessage, systemPrompt, kbResults) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for error-related queries
    if (lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('problem')) {
      if (systemPrompt.includes('recentError')) {
        return "I can see you recently encountered an error. Here's what you can try:\n\n1. **Refresh the page** - Sometimes a simple refresh resolves temporary issues\n2. **Clear your browser cache** - This can fix loading problems\n3. **Try a different browser** - To rule out browser-specific issues\n4. **Check your internet connection**\n\nIf the error persists, please describe:\n- What you were trying to do\n- The exact error message\n- Your browser and device\n\nI'll help troubleshoot or connect you with support.";
      }
      return "I'm sorry you're experiencing an issue. To help you better, could you please tell me:\n\n1. What were you trying to do?\n2. What error message did you see?\n3. What device/browser are you using?\n\nI'll help troubleshoot or escalate to our support team if needed.";
    }
    
    // Check for wallet/funds queries
    if (lowerMessage.includes('add funds') || lowerMessage.includes('deposit') || lowerMessage.includes('wallet')) {
      return "To add funds to your wallet:\n\n1. Go to the **Wallet** section\n2. Click **\"Add Funds\"**\n3. Choose your payment method:\n   - **ACH Transfer** (1-3 business days)\n   - **Debit Card** (instant)\n   - **Wire Transfer** (1-2 business days)\n4. Enter the amount and follow the prompts\n\nNeed help with a specific step?";
    }
    
    // Check for group queries
    if (lowerMessage.includes('group') || lowerMessage.includes('create group') || lowerMessage.includes('join group')) {
      return "Here's how to work with groups:\n\n**Create a Group:**\n1. Go to **Groups** section\n2. Click **\"Create New Group\"**\n3. Fill in details (name, description)\n4. Set member permissions\n5. Click **\"Create Group\"**\n\n**Join a Group:**\n1. Get an invitation link from the group admin\n2. Click the link and review details\n3. Click **\"Join Group\"**\n\nWhat would you like to do?";
    }
    
    // Check for referral queries
    if (lowerMessage.includes('referral') || lowerMessage.includes('refer') || lowerMessage.includes('invite friend')) {
      return "Our referral program rewards you for inviting friends!\n\n1. Go to your **Profile**\n2. Find your **unique referral code**\n3. Share it with friends\n4. When they sign up and deposit, you both get bonus funds!\n\nSome codes offer permanent commission on referred users. Check your profile for your personalized referral link.";
    }
    
    // Use knowledge base if we have relevant results
    if (kbResults.length > 0) {
      let response = "Based on our help documentation:\n\n" + kbResults[0].answer;
      if (kbResults.length > 1) {
        response += "\n\nRelated topics you might find helpful:\n";
        for (let i = 1; i < Math.min(3, kbResults.length); i++) {
          response += `\n• ${kbResults[i].question}`;
        }
      }
      return response;
    }
    
    // Generic help response
    if (lowerMessage.includes('help') || lowerMessage.length < 10) {
      return "I'm here to help! I can assist you with:\n\n• **Wallet** - Adding funds, withdrawals, transactions\n• **Groups** - Creating, joining, managing groups\n• **Rewards** - Daily spin, referral program\n• **Technical Issues** - Troubleshooting errors\n• **Account** - Profile settings, security\n\nWhat would you like help with?";
    }
    
    // Default response
    return "I understand you need help with that. Could you provide more details about what you're trying to do? I can help with:\n\n• Managing your wallet and funds\n• Creating or joining groups\n• Understanding rewards and bonuses\n• Troubleshooting technical issues\n• Navigating the app features\n\nWhat specific area do you need assistance with?";
  }

  // Get greeting message
  getGreetingMessage() {
    const hour = new Date().getHours();
    let greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    return `${greeting}! I'm your Bankroll assistant. I can help you navigate the app, explain features, or troubleshoot any issues. How can I help you today?`;
  }

  // Submit feedback for a message
  async submitFeedback(messageId, feedbackType, rating = null, comment = null, userId = null) {
    try {
      const { data, error } = await supabase
        .from('ai_chat_feedback')
        .insert({
          message_id: messageId,
          user_id: userId,
          feedback_type: feedbackType,
          rating,
          comment
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  // Close the current conversation
  async closeConversation() {
    if (!this.conversationId) return;

    try {
      const { error } = await supabase
        .from('ai_chat_conversations')
        .update({ status: 'closed' })
        .eq('id', this.conversationId);

      if (error) throw error;

      this.conversationId = null;
      this.messageHistory = [];
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  }

  // Escalate to human support
  async escalateToSupport(reason, userId = null) {
    if (!this.conversationId) return;

    try {
      // Update conversation status
      await supabase
        .from('ai_chat_conversations')
        .update({ 
          status: 'escalated',
          metadata: {
            escalation_reason: reason,
            escalated_at: new Date().toISOString()
          }
        })
        .eq('id', this.conversationId);

      // Add system message
      await this.addMessage('system', `Conversation escalated to human support. Reason: ${reason}`);

      // Here you could also trigger an email notification to support team
      
      return true;
    } catch (error) {
      console.error('Error escalating conversation:', error);
      return false;
    }
  }
}

export const aiChatService = new AIChatService();