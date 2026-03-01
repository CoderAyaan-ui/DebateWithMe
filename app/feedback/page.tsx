"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DebatelyChatbot from './components/DebatelyChatbot';
import { AIFeedbackService, CompleteFeedback } from '../../lib/aiFeedback';

interface FeedbackData {
  motion: string;
  role: string;
  speechText: string;
  transcript: string;
  debateType: 'world-schools' | 'british-parliamentary';
}

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [feedback, setFeedback] = useState<CompleteFeedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse feedback data from URL parameters
    const motion = searchParams.get('motion') || '';
    const role = searchParams.get('role') || '';
    const speechText = searchParams.get('speechText') || '';
    const transcript = searchParams.get('transcript') || '';
    const debateType = (searchParams.get('debateType') as 'world-schools' | 'british-parliamentary') || 'world-schools';

    if (!motion || !role) {
      router.push('/');
      return;
    }

    const data: FeedbackData = { motion, role, speechText, transcript, debateType };
    setFeedbackData(data);

    // Generate AI feedback
    generateFeedback(data);
  }, [searchParams, router]);

  const generateFeedback = async (data: FeedbackData) => {
    try {
      setLoading(true);
      const aiFeedback = await AIFeedbackService.generateFeedback(data);
      setFeedback(aiFeedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleNewDebate = () => {
    router.push('/'); // Will go to main page where they can choose debate style
  };

  if (!feedbackData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-8">Analyzing Your Speech</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-4 text-gray-600">AI is analyzing your content, delivery, and strategy...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Error generating feedback. Please try again.</p>
          <button onClick={handleBackToHome} className="mt-4 text-blue-600 underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Helper function to extract sample phrases from speech
const extractSamplePhrase = (fullText: string): string => {
  const words = fullText.split(' ');
  const start = Math.floor(words.length / 3);
  return words.slice(start, start + 8).join(' ') + '...';
};

const FeedbackSection = ({ 
    title, 
    score, 
    feedback: sectionFeedback, 
    strengths, 
    improvements,
    color
  }: {
    title: string;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    color: string;
  }) => {
    const handleImprovementClick = (improvement: string, techniqueInfo: any) => {
    // Store feedback data in localStorage for the detail page
    localStorage.setItem('feedbackDetail', JSON.stringify({
      title: improvement,
      description: techniqueInfo.description,
      speechExample: techniqueInfo.speechExample,
      goodExample: techniqueInfo.goodExample,
      technique: techniqueInfo.technique,
      practiceAdvice: techniqueInfo.practiceAdvice
    }));
    
    // Navigate to detail page
    router.push('/feedback-detail');
  };

    const getTechniqueInfo = (improvement: string, speechText: string, role: string, motion: string) => {
      if (improvement.includes('framework') || improvement.includes('criteria')) {
        return {
          technique: 'Framework Establishment',
          description: 'Essential for 1st Speakers to set up debate structure and judging criteria',
          speechExample: extractSamplePhrase(speechText),
          goodExample: `Ladies and gentlemen, today's debate centers on "${motion}". As 1st Speaker, we win this debate if we prove that economic growth outweighs environmental protection. Our framework is based on three criteria: economic impact (measured by GDP and employment), feasibility (implementation costs and timeline), and human development (education and healthcare access). According to economic theory from Smith (2023), sustainable growth is the primary measure of policy success because it creates the foundation for all other social benefits. Your current approach lacks these specific criteria and fails to establish why economic growth should be prioritized over environmental concerns - this is the critical flaw in your reasoning that must be patched.`,
          practiceAdvice: 'Practice establishing frameworks by choosing 3 measurable criteria that favor your position. Always explain WHY your criteria matter more than opponents\' criteria. Use "We win this debate if..." followed by specific metrics. Define terms advantageously and justify your framework with expert sources.'
        };
      }
      if (improvement.includes('rebuttal') || improvement.includes('They will argue')) {
        return {
          technique: 'Direct Rebuttal',
          description: 'Essential for 2nd/3rd Speakers to directly engage with opposition arguments',
          speechExample: extractSamplePhrase(speechText),
          goodExample: `They will argue that "${motion}" hurts the economy, but actually, according to OECD Economic Outlook 2023, countries with similar environmental policies saw 50% higher GDP growth over 10 years. Their economic argument is factually wrong because they ignore the green technology sector that creates 2.5 million jobs annually. Even if their economic data were correct, we still win because human welfare is the primary moral obligation - you cannot put a price on human lives. Your current reasoning fails to connect their argument to your refutation - you must patch this gap by directly stating "Their claim X is wrong because of evidence Y, and even if X were true, we still win because Z."`,
          practiceAdvice: 'Master the "They say X, but actually Y because Z" structure. Always provide specific counter-evidence with sources. Use "Even if they\'re right about X, we still win because Z" to preempt their strongest arguments. Research common opposition arguments and prepare specific rebuttals with data.'
        };
      }
      if (improvement.includes('impact') || improvement.includes('outweighs')) {
        return {
          technique: 'Impact Analysis',
          description: 'Answering the "So What?" question - why your points matter to judges',
          speechExample: extractSamplePhrase(speechText),
          goodExample: `This economic growth creates 10 million jobs and reduces poverty by 15% according to World Bank projections. This outweighs environmental costs because human welfare is the primary moral obligation - you cannot compare human lives to tree preservation. The impact is more significant because it affects millions of actual people versus potential environmental benefits. In the context of "${motion}", this is the decisive factor because poverty reduction creates long-term stability that enables environmental protection. Your current reasoning lacks this "so what" connection - you make claims but never explain why they matter to the judge\'s decision. Patch this flaw by always following every claim with "This matters because..."`,
          practiceAdvice: 'After every claim, immediately answer "So what?" Use weighing language: "outweighs," "more significant," "greater impact." Compare magnitude (how many people affected), scope (geographic reach), and probability (likelihood of occurrence). Always connect your impact to the central debate question.'
        };
      }
      if (improvement.includes('evidence') || improvement.includes('examples')) {
        return {
          technique: 'Evidence Integration',
          description: 'Using specific examples, statistics, and expert opinions to support claims',
          speechExample: extractSamplePhrase(speechText),
          goodExample: `According to the World Bank Development Report 2023, countries that implemented policies similar to "${motion}" saw an average GDP increase of 2.3% over 5 years. For example, Denmark\'s green energy transition created 15,000 new jobs and reduced carbon emissions by 40% between 2019-2022 (Danish Ministry of Climate, 2023). This evidence proves our position is not just theoretical but empirically successful. Your current reasoning lacks this evidentiary support - you make assertions without backing them with specific data or sources. Patch this flaw by always following claims with "According to [credible source]..." or "For example, in [specific case]..."`,
          practiceAdvice: 'Collect specific statistics with years and sources. Cite credible sources: World Bank, IMF, academic studies, government reports. Use "For example..." or "According to..." structures. Make evidence concrete, verifiable, and recent (within 5 years). Always connect evidence back to your main argument.'
        };
      }
      return {
        technique: 'Debate Technique',
        description: 'General debate improvement strategy',
        speechExample: extractSamplePhrase(speechText),
        goodExample: `In the context of "${motion}", as ${role}, you must structure your argument using proper debate techniques. For example: "This policy creates significant benefits because..." followed by specific evidence like "According to [source], similar policies increased GDP by X%..." then impact analysis "This matters because it affects Y million people..." Your current reasoning lacks this logical flow - you jump between ideas without connecting them. Patch this flaw by always using Claim-Evidence-Impact structure for every point.`,
        practiceAdvice: 'Master the Claim-Evidence-Impact structure. Always connect your evidence to your claim and your impact to the debate question. Practice with specific examples from current events. Get feedback from experienced debaters on your logical flow.'
      };
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
          <div className={`text-3xl font-bold ${color}`}>
            {score}/100
          </div>
        </div>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${color.replace('text', 'bg')}`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        <p className="text-gray-700 mb-6">{sectionFeedback}</p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {strengths.map((strength, index) => (
                <li key={index} className="text-sm">{strength}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {improvements.map((improvement, index) => {
                const techniqueInfo = getTechniqueInfo(improvement, feedbackData.speechText + ' ' + feedbackData.transcript, feedbackData.role, feedbackData.motion);
                return (
                  <li key={index} className="text-sm">
                    <button
                      onClick={() => handleImprovementClick(improvement, techniqueInfo)}
                      className="text-blue-600 hover:text-blue-800 underline text-left"
                      title={`Click to learn more about: ${improvement}`}
                    >
                      {improvement}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToHome}
            className="mb-4 text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">
            Debate Performance Feedback
          </h1>
          <p className="text-center text-gray-600">
            AI-powered analysis of your speech
          </p>
        </div>

        {/* Motion and Role */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Motion:</h2>
            <div className="text-lg font-medium text-blue-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
              {feedbackData.motion}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Role:</h2>
            <div className="text-base font-medium text-green-700 bg-green-50 p-3 rounded border-l-4 border-green-500">
              {feedbackData.role}
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 mb-6 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Overall Performance Score</h2>
            <div className="text-5xl font-bold mb-4">{feedback.overallScore}/100</div>
            <p className="text-lg opacity-90">{feedback.summary}</p>
          </div>
        </div>

        {/* Feedback Sections */}
        <div className="space-y-6 mb-8">
          <FeedbackSection
            title={feedback.content.title}
            score={feedback.content.score}
            feedback={feedback.content.feedback}
            strengths={feedback.content.strengths}
            improvements={feedback.content.improvements}
            color="text-blue-600"
          />
          
          <FeedbackSection
            title={feedback.delivery.title}
            score={feedback.delivery.score}
            feedback={feedback.delivery.feedback}
            strengths={feedback.delivery.strengths}
            improvements={feedback.delivery.improvements}
            color="text-green-600"
          />
          
          <FeedbackSection
            title={feedback.strategy.title}
            score={feedback.strategy.score}
            feedback={feedback.strategy.feedback}
            strengths={feedback.strategy.strengths}
            improvements={feedback.strategy.improvements}
            color="text-purple-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={handleNewDebate}
            className="bg-blue-600 text-white text-lg font-semibold py-3 px-8 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Start New Debate
          </button>
          <div className="text-sm text-gray-600">
            Practice regularly to improve your debate skills!
          </div>
        </div>
      </div>
      
      {/* Debately Chatbot */}
      <DebatelyChatbot 
        motion={feedbackData.motion}
        role={feedbackData.role}
        feedback={feedback}
      />
    </div>
  );
}

export default function Feedback() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  );
}
