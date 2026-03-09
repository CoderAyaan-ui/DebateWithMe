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
      text: `Hi! I'm Debately, your AI debate coach. I'm here to help you improve your debate performance on "${motion}" as ${role}! 

I have comprehensive knowledge about this motion including:
- Key arguments for both sides
- Real-world examples and statistics
- Effective debate techniques
- Specific rebuttal strategies

I can help you with:
- **Framework establishment** (if you're 1st Speaker)
- **Argument development** with motion-specific content
- **Evidence integration** using real-world examples
- **Rebuttal strategies** tailored to this motion
- **Technique mastery** (CWI, parallelism, etc.)

What specific aspect of your performance or debate techniques would you like me to help you with?`,
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
    
    // Comprehensive motion knowledge base
    const motionKnowledge: Record<string, any> = {
      "meritocracy is a myth": {
        definition: "Meritocracy claims that success is based purely on merit and ability, but critics argue it's a myth because of structural barriers, inherited advantages, and systemic biases",
        proArguments: [
          "Meritocracy incentivizes hard work and innovation",
          "It allocates resources efficiently based on competence",
          "Merit-based systems reduce corruption and favoritism",
          "It rewards talent and drives economic growth",
          "People should earn positions through ability, not birthright"
        ],
        conArguments: [
          "Starting positions are unequal due to wealth, education, and social capital",
          "Cultural biases favor certain groups over others",
          "Access to opportunities depends on privilege, not just merit",
          "Systemic barriers prevent equal competition",
          "Success often depends on luck and timing, not just merit"
        ],
        realWorldExamples: [
          "Educational disparities: Students from wealthy families have advantages in test preparation and college admissions",
          "Hiring biases: Studies show résumés with 'white-sounding' names get more callbacks",
          "Gender pay gap: Women earn less than men for the same work despite equal qualifications",
          "Legacy admissions: Elite universities give preference to children of alumni",
          "Venture capital: Most funding goes to founders from privileged backgrounds"
        ],
        keyConcepts: ["Social mobility", "Equal opportunity", "Structural inequality", "Privilege", "Systemic bias", "Cultural capital"]
      }
    };
    
    // Get motion-specific knowledge
    const motionKey = Object.keys(motionKnowledge).find(key => motion.toLowerCase().includes(key.toLowerCase()));
    const motionInfo = motionKey ? motionKnowledge[motionKey] : null;
    
    // Dynamic response generation based on user intent
    const generateDynamicResponse = () => {
      // Check if user is asking for specific help
      if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('tell me')) {
        // Framework-specific help
        if (lowerMessage.includes('framework') || lowerMessage.includes('criteria')) {
          if (role.includes('1st Speaker') && motionInfo) {
            return `As 1st Speaker for "${motion}", here's exactly what you should do:

**Framework Setup:**
"Ladies and gentlemen, today's debate centers on whether ${motion}. We win this debate if we prove that: (1) Systemic barriers prevent genuine meritocracy, (2) Privilege and inheritance create unequal starting positions, and (3) Cultural biases distort merit evaluation."

**Why This Works:**
Your criteria focus on structural reality rather than ideal theory. You can argue that even if meritocracy sounds good in theory, the practical reality makes it impossible.

**Specific Evidence:**
- Educational inequality: Students from wealthy families have 10x more resources
- Corporate hiring: 70% of executives come from just 12% universities
- Gender/race disparities: Equal qualifications don't lead to equal outcomes

**Rebuttal Prep:**
Expect Proposition to argue about "incentives" and "efficiency" - counter by showing these benefits don't materialize when the system is fundamentally unfair.

Want me to help you develop the specific wording for each criterion?`;
          } else if (!role.includes('1st Speaker')) {
            return `As ${role}, here's exactly what to do:

**Reference the Framework:**
"Building on our framework of [established criteria], my first point shows how ${motion} fails to achieve the stated goals..."

**Your Job:**
- Reference the established criteria that favor your side
- Show how your arguments fit within that framework
- Use the criteria to evaluate the opposition's arguments

**Example:**
"Building on our framework of equal opportunity, social mobility, and fairness, my first point demonstrates how ${motion} undermines genuine meritocracy through structural barriers..."

Need help with specific arguments for your role?`;
          }
        }
        
        // Argument-specific help
        else if (lowerMessage.includes('argument') || lowerMessage.includes('point') || lowerMessage.includes('say')) {
          if (motionInfo) {
            const isOpposition = role.toLowerCase().includes('opposition');
            const debateArguments = isOpposition ? motionInfo.conArguments : motionInfo.proArguments;
            const examples = motionInfo.realWorldExamples;
            
            return `Here are specific arguments you could make for "${motion}" as ${role}:

**Main Arguments:**
${debateArguments.map((arg: string, i: number) => `${i + 1}. ${arg}`).join('\n')}

**Real-World Evidence:**
${examples.map((example: string, i: number) => `${i + 1}. ${example}`).join('\n')}

**How to Structure Each Point:**
"First, [your argument]. **So what?** [explain why it matters]. **Why this?** [show how it proves the motion]. **How?** [demonstrate the mechanism]."

**Example:**
"First, unequal starting positions make meritocracy impossible. **So what?** This means people don't compete on equal footing. **Why this?** Because success depends on birth circumstances, not merit. **How?** Through inherited wealth, educational disparities, and cultural biases."

Which argument would you like me to help you develop further?`;
          }
        }
        
        // Rebuttal help
        else if (lowerMessage.includes('rebuttal') || lowerMessage.includes('counter') || lowerMessage.includes('opposition')) {
          if (motionInfo) {
            return `Here are specific rebuttal strategies for "${motion}":

**Common Proposition Arguments & Counters:**

**If they say "Meritocracy incentivizes hard work":**
Counter: "Hard work means nothing without opportunity. Studies show people from disadvantaged backgrounds work just as hard but achieve less due to systemic barriers. The issue isn't work ethic - it's access to opportunities."

**If they say "Efficiency and economic growth":**
Counter: "Systems that exclude talent are inherently inefficient. We lose the contributions of capable people who lack privilege, reducing overall productivity. True efficiency requires utilizing all talent, not just privileged talent."

**If they say "Reduces corruption":**
Counter: "Meritocracy often hides corruption behind 'objective' criteria that actually favor privileged groups. This is worse than overt corruption because it's harder to identify and address."

**Rebuttal Structure:**
1. Acknowledge their argument
2. Show how your framework better evaluates the issue
3. Provide counter-examples
4. Demonstrate greater impact

**Example:**
"While my opponent makes a valid point about incentives, they miss the fundamental question: can people even access those incentives? When 70% of opportunities go to people from the top 10% of income backgrounds, the 'incentives' only exist for the privileged."

Which specific argument do you need help rebutting?`;
          }
        }
        
        // Evidence help
        else if (lowerMessage.includes('evidence') || lowerMessage.includes('example') || lowerMessage.includes('statistics') || lowerMessage.includes('data')) {
          if (motionInfo) {
            return `Here's specific evidence for "${motion}":

**Educational Inequality:**
- Students from top 1% income families are 77x more likely to attend Ivy League schools
- Black students receive 40% less financial aid despite equal need
- Test preparation costs $10,000+ for wealthy families vs. $0 for poor families

**Economic Disparities:**
- Children of the top 1% inherit 7x more than bottom 50% earn in their lifetime
- 60% of CEOs come from families in the top 1% of wealth
- Venture capital funding goes 90% to founders from privileged backgrounds

**Gender/Race Bias:**
- Women earn 82 cents for every dollar men earn for the same work
- Résumés with 'white-sounding' names get 50% more callbacks
- Only 6% of Fortune 500 CEOs are women despite being 50% of the population

**How to Use This Evidence:**
Always connect statistics to your framework criteria. For example: "This proves criterion 1 - systemic barriers prevent genuine meritocracy because..."

Which type of evidence do you need help integrating into your arguments?`;
          }
        }
        
        // Technique help
        else if (lowerMessage.includes('technique') || lowerMessage.includes('how to') || lowerMessage.includes('method')) {
          return `Here are specific techniques for "${motion}" as ${role}:

**1. Claim-Warrant-Impact (CWI):**
- Claim: "Meritocracy is a myth"
- Warrant: "Starting positions are fundamentally unequal"
- Impact: "This means society loses talent and perpetuates injustice"

**2. Parallelism:**
"Not only does meritocracy fail in theory, but it also fails in practice. Not only does it exclude the disadvantaged, but it also rewards the undeserving."

**3. Rhetorical Questions:**
"If we truly believe in merit, why do children of the wealthy have such enormous advantages? If we value talent, why do we exclude so much of it?"

**4. Comparative Analysis:**
"Education-based opportunities are more significant than economic incentives because education determines access to those very opportunities."

**5. Signposting:**
"First, I'll demonstrate the structural barriers... Second, I'll show how privilege distorts merit... Finally, I'll prove the real-world consequences."

**Practice with your motion:**
Try using these techniques with the specific arguments about meritocracy. For example, use parallelism to list multiple ways meritocracy fails.

Which technique would you like me to help you practice?`;
        }
      }
      
      // If no specific intent detected, provide general help
      return `I can help you with your debate performance on "${motion}" as ${role}! 

Here's what I can do:

**Specific Help:**
- **Framework establishment** (if you're 1st Speaker)
- **Argument development** with motion-specific content  
- **Evidence integration** using real-world examples
- **Rebuttal strategies** for common opposition arguments
- **Technique mastery** (CWI, parallelism, rhetorical questions)

**Just ask me things like:**
- "How do I establish a framework?"
- "What arguments should I make?"
- "Give me evidence for my points"
- "How do I rebut their argument?"
- "What techniques should I use?"

What specific aspect of your debate would you like help with?`;
    };
    
    return generateDynamicResponse();
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

    // Simulate Debately thinking
    setTimeout(() => {
      const debatelyResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateDebatelyResponse(inputValue),
        sender: 'debately',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, debatelyResponse]);
      setIsTyping(false);
    }, 1000);
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
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          💬
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">D</span>
          </div>
          <div>
            <h3 className="font-semibold">Debately AI Coach</h3>
            <p className="text-xs opacity-90">Your debate assistant</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white hover:bg-blue-700 p-1 rounded"
        >
          −
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about debate techniques..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isTyping}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
