"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FeedbackDetail {
  title: string;
  description: string;
  speechExample: string;
  goodExample: string;
  technique: string;
  practiceAdvice: string;
}

function FeedbackDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [feedbackDetail, setFeedbackDetail] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Prevent going back during debate
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Please complete the debate before leaving.';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // Try to get feedback detail from localStorage first
    const storedData = localStorage.getItem('feedbackDetail');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFeedbackDetail(parsedData);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
    
    // Fallback to URL parameters if localStorage doesn't work
    const detail = searchParams.get('detail');
    const type = searchParams.get('type') || 'content';
    const title = searchParams.get('title') || '';
    const description = searchParams.get('description') || '';
    const speechExample = searchParams.get('speechExample') || '';
    const goodExample = searchParams.get('goodExample') || '';
    const technique = searchParams.get('technique') || '';
    const practiceAdvice = searchParams.get('practiceAdvice') || '';

    // Set feedback detail if we have valid parameters
    if (detail && title && description && speechExample && goodExample && technique && practiceAdvice) {
      setFeedbackDetail({
        title: decodeURIComponent(title),
        description: decodeURIComponent(description),
        speechExample: decodeURIComponent(speechExample),
        goodExample: decodeURIComponent(goodExample),
        technique: decodeURIComponent(technique),
        practiceAdvice: decodeURIComponent(practiceAdvice)
      });
    }
    setLoading(false);
  }, [searchParams]);

  const handleBackToFeedback = () => {
    // Clear localStorage and navigate back
    localStorage.removeItem('feedbackDetail');
    // Use router.back() to go to previous page
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback details...</p>
        </div>
      </div>
    );
  }

  if (!feedbackDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Feedback detail not found</p>
          <button
            onClick={handleBackToFeedback}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            Back to Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToFeedback}
            className="text-blue-600 hover:text-blue-800 underline mb-4"
          >
            ← Back to Feedback
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {feedbackDetail.title}
          </h1>
          <p className="text-gray-600 text-lg">
            {feedbackDetail.description}
          </p>
        </div>

        {/* Technique Explanation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            🎯 Technique: {feedbackDetail.technique}
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-gray-700 leading-relaxed">
              {feedbackDetail.technique === 'Framework Establishment' && (
                <span>
                  <strong>Framework Establishment</strong> is the foundation of 1st Speaker speeches. 
                  You establish criteria for how judges should evaluate the debate and define key terms in ways that favor your position. 
                  This sets up the entire debate structure for your team and limits opposition arguments.
                </span>
              )}
              {feedbackDetail.technique === 'Direct Rebuttal' && (
                <span>
                  <strong>Direct Rebuttal</strong> is essential for 2nd/3rd Speakers. 
                  You must directly engage with opposition arguments using "They say X, but actually Y" structure. 
                  This shows judges you're listening and responding, not just giving a prepared speech.
                </span>
              )}
              {feedbackDetail.technique === 'Impact Analysis' && (
                <span>
                  <strong>Impact Analysis</strong> answers the "So What?" question. 
                  After making any claim or rebuttal, you must immediately explain why it matters to the judge's decision. 
                  Use weighing mechanisms like "outweighs," "more significant," and "greater impact."
                </span>
              )}
              {feedbackDetail.technique === 'Evidence Integration' && (
                <span>
                  <strong>Evidence Integration</strong> makes arguments credible. 
                  Use specific examples, statistics, or expert opinions to support your claims. 
                  Instead of saying "this hurts the economy," say "In Country X, similar policies led to 3% GDP growth according to World Bank data."
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Your Speech Example */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            📝 What You Said
          </h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-gray-700 italic">
              "{feedbackDetail.speechExample}"
            </p>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded border-l-4 border-yellow-500">
            <p className="text-gray-700">
              <strong>❌ Problem:</strong> This lacks the proper technique structure and impact analysis.
            </p>
          </div>
        </div>

        {/* Good Example */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-600 mb-4">
            ✅ How It Should Be Done
          </h2>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-gray-700">
              "{feedbackDetail.goodExample}"
            </p>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded border-l-4 border-blue-500">
            <p className="text-gray-700">
              <strong>✅ Why This Works:</strong> This example properly applies the technique with clear structure, evidence, and impact analysis.
            </p>
          </div>
        </div>

        {/* Practice Advice */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-purple-600 mb-4">
            🎯 Practice This Technique
          </h2>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <p className="text-gray-700 leading-relaxed">
              {feedbackDetail.practiceAdvice}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleBackToFeedback}
            className="bg-blue-600 text-white text-lg font-semibold py-3 px-8 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Back to All Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackDetail() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback details...</p>
        </div>
      </div>
    }>
      <FeedbackDetailContent />
    </Suspense>
  );
}
