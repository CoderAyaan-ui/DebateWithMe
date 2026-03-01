"use client";
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'debately';
  timestamp: Date;
}

interface DebatelyChatbotProps {
  motion?: string;
  role?: string;
  feedback?: any;
}

export default function DebatelyChatbot({ motion = "", role = "", feedback = null }: DebatelyChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Debately, your AI debate coach. I'm here to help you understand your feedback and answer any questions about debate techniques. What would you like to know?",
      sender: 'debately',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateDebatelyResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Framework-related responses with context
    if (lowerMessage.includes('framework') || lowerMessage.includes('criteria')) {
      if (role.includes('1st Speaker')) {
        return `As 1st Speaker for the motion "${motion}", your framework should establish criteria that favor your position. For example: 'Ladies and gentlemen, today's debate centers on ${motion}. We win this debate if we prove that [your criteria 1], [criteria 2], and [criteria 3].' Your criteria should be measurable and favor your side. For instance, if the motion is about economic growth, use criteria like GDP impact, job creation, and poverty reduction. Always explain WHY your criteria matter more than your opponents' criteria.`;
      } else {
        return `Since you're ${role}, you don't establish the framework - that's the 1st Speaker's job. Instead, you should reference the established framework and show how your arguments fit within it. For example: 'Building on our framework of economic impact, feasibility, and human development, my first point shows how ${motion} achieves superior economic outcomes...'`;
      }
    }
    
    // Rebuttal-related responses with context
    if (lowerMessage.includes('rebuttal') || lowerMessage.includes('refute')) {
      if (role.includes('1st Speaker')) {
        return `As 1st Speaker, you don't do direct rebuttals - that's for 2nd/3rd Speakers. Your job is to establish the framework and build your team's case. However, you should preempt potential opposition arguments. For example: 'While some may argue that ${motion} has negative consequences, they ignore the fact that...' This shows you're thinking ahead.`;
      } else {
        return `As ${role}, rebuttal is your primary job! For the motion "${motion}", you should anticipate what opposition will argue. For example: 'They will argue that ${motion} hurts the economy, but actually, according to OECD data, countries with similar policies saw 50% higher GDP growth.' Always use the 'They say X, but actually Y because Z' structure and provide specific evidence.`;
      }
    }
    
    // Impact-related responses with context
    if (lowerMessage.includes('impact') || lowerMessage.includes('so what')) {
      return `For the motion "${motion}", impact analysis is crucial! After every claim, answer "So What?" For example: 'This policy creates 10 million jobs. This matters because it reduces poverty by 15% and affects millions of real people. In the context of ${motion}, this outweighs environmental concerns because human welfare is the primary moral obligation.' Always connect your impact back to the central debate question and use weighing language like 'outweighs' and 'more significant.'`;
    }
    
    // Evidence-related responses with context
    if (lowerMessage.includes('evidence') || lowerMessage.includes('examples')) {
      return `For "${motion}", you need specific evidence! Instead of saying 'this helps the economy,' say: 'According to the World Bank 2023 report, countries implementing similar policies saw 2.3% GDP growth over 5 years. For example, Denmark's green energy transition created 15,000 jobs between 2019-2022.' Always cite specific sources, use recent data, and connect evidence back to the motion.`;
    }
    
    // Motion-specific responses
    if (lowerMessage.includes('motion') || lowerMessage.includes('topic') || lowerMessage.includes('about')) {
      return `The motion is "${motion}". As ${role}, you need to either support or oppose this proposition. Your arguments should directly address the core tension in the motion. For example, if this is about economic vs environmental concerns, you'd need to weigh which is more important and provide specific evidence for your position. Always connect every point back to the central question of whether we should ${motion}.`;
    }
    
    // Role-specific responses
    if (lowerMessage.includes('role') || lowerMessage.includes('job')) {
      if (role.includes('1st Speaker')) {
        return `As 1st Speaker, your job is to FRAME the debate for "${motion}". Establish criteria, define key terms advantageously, and build foundation for your team. You're not just making points - you're setting up the entire debate structure. Focus on framework establishment and principled arguments that your later speakers can build upon.`;
      } else {
        return `As ${role}, your PRIMARY job is to REBUTTAL opposition and EXTEND your case for "${motion}". Balance refutation with development. Use direct engagement: 'They will argue X, but actually Y...' Then extend with new arguments that build on your team's framework. You must show judges you're listening and responding.`;
      }
    }
    
    // Score-related responses with context
    if (lowerMessage.includes('score') || lowerMessage.includes('grade') || lowerMessage.includes('feedback')) {
      if (feedback) {
        const score = feedback.overallScore || 0;
        if (score < 40) {
          return `Your score of ${score}/100 indicates significant room for improvement with "${motion}". Focus on the specific improvements listed - they address concrete techniques like framework establishment, impact analysis, and evidence integration. For example, if you're 1st Speaker, work on establishing clear criteria. If you're 2nd/3rd Speaker, focus on direct rebuttals.`;
        } else if (score < 70) {
          return `Your score of ${score}/100 shows you have some good elements but need refinement for "${motion}". The feedback highlights specific areas to improve. For instance, strengthen your impact analysis by always answering "So What?" and provide more specific evidence with sources like World Bank or OECD data.`;
        } else {
          return `Your score of ${score}/100 is strong! For "${motion}", you're applying debate techniques well. To reach the next level, focus on making your arguments more sophisticated with deeper impact analysis and more compelling evidence. Consider using comparative analysis and advanced weighing mechanisms.`;
        }
      }
      return `Your score reflects how well you applied debate techniques to "${motion}". Focus on the specific improvements listed in your feedback - each addresses a concrete technique that will boost your performance on this motion.`;
    }
    
    // General technique responses with context
    if (lowerMessage.includes('technique') || lowerMessage.includes('how to') || lowerMessage.includes('help')) {
      return `For the motion "${motion}" as ${role}, the key techniques are: 1) Framework Establishment (if you're 1st Speaker), 2) Direct Rebuttal (if you're 2nd/3rd Speaker), 3) Impact Analysis (answering 'So What?'), and 4) Evidence Integration (using specific examples). Always use the Claim-Evidence-Impact structure and connect everything back to whether we should ${motion}. What specific technique would you like me to explain?`;
    }
    
    // Default response with context
    return `I'm here to help you improve your debate performance on "${motion}" as ${role}! I can explain specific techniques like framework establishment, rebuttals, impact analysis, or evidence integration. I can also help you understand your feedback and score. What specific aspect of your performance or the debate techniques would you like me to clarify?`;
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Debately thinking and responding
    setTimeout(() => {
      const debatelyResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateDebatelyResponse(inputValue),
        sender: 'debately',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, debatelyResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-semibold">Debately</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-bold text-lg">Debately</h3>
          <span className="text-xs opacity-75">AI Debate Coach</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white hover:text-gray-200 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Debately about your feedback..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-blue-600"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || inputValue.trim() === ''}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Debately can help with framework, rebuttals, impact analysis, and evidence techniques
        </p>
      </div>
    </div>
  );
}
