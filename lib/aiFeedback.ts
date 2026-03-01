export interface FeedbackData {
  motion: string;
  role: string;
  speechText: string;
  transcript: string;
  debateType: 'world-schools' | 'british-parliamentary';
}

export interface FeedbackSection {
  title: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface CompleteFeedback {
  content: FeedbackSection;
  delivery: FeedbackSection;
  strategy: FeedbackSection;
  overallScore: number;
  summary: string;
}

export class AIFeedbackService {
  private static generateContentFeedback(data: FeedbackData): FeedbackSection {
    const { motion, role, speechText, transcript } = data;
    const fullText = speechText + ' ' + transcript;
    
    // HARSH evaluation for short content
    if (!fullText || fullText.split(' ').length < 50) {
      return {
        title: 'Content',
        score: 10,
        feedback: "COMPLETELY UNACCEPTABLE: Two words is NOT a debate speech. In competitive debate, you would automatically lose for failure to meet minimum speaking requirements. A debate speech requires substantial content, arguments, evidence, and analysis. Your 'speech' demonstrates zero understanding of debate fundamentals, zero engagement with motion, and zero effort. This is not debate - it's barely communication.",
        strengths: [],
        improvements: [
          "Speak for at least 3-4 minutes with substantial content",
          "Use 'Claim-Warrant-Impact' structure for EVERY argument",
          "Master the 'So What? Why This? How?' framework religiously",
          "Use rhetorical questions: 'What does this mean for society?'",
          "Learn to 'weigh' arguments using 'outweighs' and 'greater impact'",
          "Incorporate specific examples, statistics, and expert opinions",
          "Use signposting: 'First... Second... Finally...'",
          "Master parallelism: 'Not just X, but also Y'",
          "Use analogies and metaphors for complex concepts",
          "Learn to preempt counterarguments with 'While some may argue...'",
          "Use 'Framework' technique as 1st Speaker",
          "Master causal reasoning with 'because' and 'therefore'",
          "Use comparative analysis: 'more significant than'",
          "Learn to use 'criteria for judging' frameworks",
          "Master the art of 'impact calculus'",
          "Use specific rhetorical devices: antithesis, tricolon",
          "Learn to structure arguments with 'Point-Example-Explanation'",
          "Master the 'Even if' technique for concession",
          "Use 'Timeframe' analysis: short-term vs long-term impacts",
          "Learn to 'link' arguments to central motion",
          "Master the 'burden of proof' concept",
          "Use 'stakeholder analysis' for comprehensive coverage",
          "Learn to use 'principled vs practical' distinctions"
        ]
      };
    }

    // Detailed content analysis for proper speeches
    const analysis = this.analyzeContentQuality(motion, fullText, role);
    let score = analysis.baseScore;
    
    // Apply role-specific adjustments
    if (role.includes('1st Speaker')) {
      score += analysis.framingQuality * 10;
    } else if (role.includes('2nd Speaker') || role.includes('3rd Speaker')) {
      score += analysis.rebuttalQuality * 10;
    }
    
    score = Math.max(20, Math.min(95, score)); // More realistic scoring range
    
    return {
      title: 'Content',
      score: Math.round(score),
      feedback: analysis.detailedFeedback,
      strengths: analysis.specificStrengths,
      improvements: analysis.specificImprovements
    };
  }

  private static generateDeliveryFeedback(data: FeedbackData): FeedbackSection {
    const { transcript } = data;
    
    if (!transcript || transcript.split(' ').length < 100) {
      return {
        title: 'Delivery',
        score: 15,
        feedback: "UNACCEPTABLE: Your speech was far too short for proper evaluation. A debate speech requires 3-4 minutes minimum to demonstrate delivery skills. Two words is not a speech - it&apos;s barely a sentence. In competitive debate, you&apos;d lose the round automatically for insufficient material. You need to speak for at least 400-500 words to even begin demonstrating basic delivery competence.",
        strengths: [],
        improvements: [
          "Speak for at least 3-4 minutes minimum (400-500 words)",
          "Use vocal variety - vary pace, pitch, and volume dramatically",
          "Practice proper diaphragmatic breathing for voice control",
          "Record yourself daily to identify pacing and filler issues",
          "Learn to use strategic pauses for emphasis",
          "Practice reading aloud with emotional expression",
          "Master the art of vocal emphasis on key words",
          "Develop confident posture and gestures",
          "Eliminate ALL filler words - replace with deliberate pauses",
          "Practice speaking at 130-150 words per minute consistently",
          "Learn to project your voice without shouting",
          "Master eye contact techniques (even in practice)",
          "Develop vocal warm-up routines before speaking",
          "Practice varying sentence length for rhythm",
          "Learn to use silence as a rhetorical tool",
          "Record and analyze your pitch variations",
          "Practice enunciation exercises for clarity",
          "Master the art of speaking with conviction",
          "Develop techniques for maintaining energy throughout",
          "Learn to modulate volume for different impact levels"
        ]
      };
    }
    
    const analysis = this.analyzeDeliveryQuality(transcript);
    let score = analysis.baseScore;
    
    // Realistic scoring based on actual performance
    if (analysis.fillerRatio > 0.15) score -= 20;
    if (analysis.pacingIssues) score -= 15;
    if (analysis.monotone) score -= 10;
    
    score = Math.max(20, Math.min(90, score));
    
    return {
      title: 'Delivery',
      score: Math.round(score),
      feedback: analysis.detailedFeedback,
      strengths: analysis.specificStrengths,
      improvements: analysis.specificImprovements
    };
  }

  private static generateStrategyFeedback(data: FeedbackData): FeedbackSection {
    const { motion, role, speechText, transcript } = data;
    const fullText = speechText + ' ' + transcript;
    
    if (!fullText || fullText.split(' ').length < 50) {
      return {
        title: 'Strategy',
        score: 12,
        feedback: "STRATEGIC FAILURE: You demonstrated zero strategic awareness. Debate is not just talking - it's structured argumentation with purpose. Your 'speech' lacks introduction, body, conclusion, examples, impact analysis, and any semblance of competitive strategy. This is amateur-level performance that would be eliminated in any tournament.",
        strengths: [],
        improvements: [
          "Use 'Signposting' - 'First, I will address... Second, I will examine...'",
          "Add concrete examples: 'For instance, in Country X...'",
          "Use weighing mechanisms: 'outweighs,' 'more significant,' 'greater impact'",
          "Establish judging criteria: 'We win this debate if...'",
          "Preempt counterarguments: 'While some may argue...'",
          "Use rhetorical devices: parallelism, analogies, and metaphors",
          "Master the 'Framework' technique as 1st Speaker",
          "Learn to use 'Impact Calculus' - magnitude, scope, probability",
          "Use 'Comparative Analysis' - more important than, outweighs",
          "Master 'Timeframe' analysis - short-term vs long-term",
          "Use 'Stakeholder Analysis' - who is affected and how",
          "Learn to 'Link' arguments to motion directly",
          "Use 'Even if' technique for concession",
          "Master 'Burden of Proof' distribution",
          "Use 'Principled vs Practical' distinctions",
          "Learn to 'Weigh' using criteria",
          "Master 'Rebuttal' structure: 'They say X, but actually Y'",
          "Use 'Comparative' language throughout",
          "Learn to 'Summarize' and 'Crystallize' key points"
        ]
      };
    }
    
    const analysis = this.analyzeStrategicQuality(motion, fullText, role);
    let score = analysis.baseScore;
    
    // Heavier penalties for strategic flaws
    if (!analysis.hasStructure) score -= 25;
    if (!analysis.hasExamples) score -= 20;
    if (!analysis.hasImpact) score -= 15;
    if (analysis.logicalFallacies > 0) score -= (analysis.logicalFallacies * 10);
    
    score = Math.max(15, Math.min(95, score));
    
    return {
      title: 'Strategy',
      score: Math.round(score),
      feedback: analysis.detailedFeedback,
      strengths: analysis.specificStrengths,
      improvements: analysis.specificImprovements
    };
  }

  public static async generateFeedback(data: FeedbackData): Promise<CompleteFeedback> {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const content = this.generateContentFeedback(data);
    const delivery = this.generateDeliveryFeedback(data);
    const strategy = this.generateStrategyFeedback(data);
    
    const overallScore = Math.round((content.score + delivery.score + strategy.score) / 3);
    const summary = this.generateRealisticSummary(content.score, delivery.score, strategy.score, data.role);
    
    return {
      content,
      delivery,
      strategy,
      overallScore,
      summary
    };
  }

  // Advanced analysis methods
  private static analyzeContentQuality(motion: string, fullText: string, role: string): {
    baseScore: number;
    framingQuality: number;
    rebuttalQuality: number;
    detailedFeedback: string;
    specificStrengths: string[];
    specificImprovements: string[];
  } {
    const text = fullText.toLowerCase();
    const motionWords = motion.toLowerCase().split(/\s+/);
    
    // Check actual relevance
    const relevantKeywords = motionWords.filter(word => 
      word.length > 3 && text.includes(word)
    );
    const relevanceScore = relevantKeywords.length / Math.max(motionWords.length - 2, 1);
    
    // Analyze argument depth
    const argumentMarkers = ['because', 'therefore', 'thus', 'consequently', 'as a result'];
    const argumentDepth = argumentMarkers.filter(marker => text.includes(marker)).length;
    
    // Check for evidence/examples
    const evidenceMarkers = ['for example', 'for instance', 'specifically', 'according to', 'research shows'];
    const hasEvidence = evidenceMarkers.some(marker => text.includes(marker));
    
    // Role-specific analysis
    let framingQuality = 0.5;
    let rebuttalQuality = 0.5;
    
    if (role.includes('1st Speaker')) {
      framingQuality = text.includes('framework') || text.includes('define') || text.includes('today') ? 0.8 : 0.3;
    }
    
    if (role.includes('2nd Speaker') || role.includes('3rd Speaker')) {
      rebuttalQuality = text.includes('however') || text.includes('they said') || text.includes('opposition claims') ? 0.7 : 0.2;
    }
    
    let baseScore = 40;
    if (relevanceScore > 0.6) baseScore += 25;
    if (argumentDepth >= 2) baseScore += 15;
    if (hasEvidence) baseScore += 10;
    if (fullText.split(' ').length > 200) baseScore += 10;
    
    return {
      baseScore,
      framingQuality,
      rebuttalQuality,
      detailedFeedback: this.generateDetailedContentFeedback(relevanceScore, argumentDepth, hasEvidence, role, fullText),
      specificStrengths: this.generateSpecificContentStrengths(relevanceScore, argumentDepth, hasEvidence, fullText),
      specificImprovements: this.generateSpecificContentImprovements(relevanceScore, argumentDepth, hasEvidence, role, fullText)
    };
  }

  private static analyzeDeliveryQuality(transcript: string): {
    baseScore: number;
    fillerRatio: number;
    pacingIssues: boolean;
    monotone: boolean;
    estimatedMinutes: number;
    detailedFeedback: string;
    specificStrengths: string[];
    specificImprovements: string[];
  } {
    const words = transcript.split(' ');
    const wordCount = words.length;
    
    // Estimate speaking time (assuming 7 minutes target)
    const estimatedMinutes = wordCount / 140; // Average speaking rate
    const pacingIssues = estimatedMinutes < 4 || estimatedMinutes > 9;
    
    // Count filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'sort of'];
    const fillerCount = fillerWords.reduce((count, filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      return count + (transcript.match(regex) || []).length;
    }, 0);
    
    const fillerRatio = fillerCount / wordCount;
    
    // Detect monotone patterns (simplified)
    const sentenceEndings = (transcript.match(/[.!?]/g) || []).length;
    const monotone = sentenceEndings < 5; // Too few sentence variations
    
    let baseScore = 50;
    if (!pacingIssues) baseScore += 20;
    if (fillerRatio < 0.08) baseScore += 15;
    if (!monotone) baseScore += 15;
    
    return {
      baseScore,
      fillerRatio,
      pacingIssues,
      monotone,
      estimatedMinutes,
      detailedFeedback: this.generateDetailedDeliveryFeedback(fillerRatio, pacingIssues, monotone, estimatedMinutes),
      specificStrengths: this.generateSpecificDeliveryStrengths(fillerRatio, pacingIssues, monotone),
      specificImprovements: this.generateSpecificDeliveryImprovements(fillerRatio, pacingIssues, monotone, estimatedMinutes)
    };
  }

  private static analyzeStrategicQuality(motion: string, fullText: string, role: string): {
    baseScore: number;
    hasStructure: boolean;
    hasExamples: boolean;
    hasImpact: boolean;
    logicalFallacies: number;
    detailedFeedback: string;
    specificStrengths: string[];
    specificImprovements: string[];
  } {
    const text = fullText.toLowerCase();
    
    // Structure analysis
    const hasIntroduction = text.includes('introduction') || text.includes('today') || text.includes('ladies and gentlemen');
    const hasBody = text.split(' ').length > 100;
    const hasConclusion = text.includes('conclusion') || text.includes('in conclusion') || text.includes('thank you');
    const hasStructure = hasIntroduction && hasBody && hasConclusion;
    
    // Examples and evidence
    const hasExamples = text.includes('for example') || text.includes('for instance') || text.includes('specifically');
    
    // Impact and weighing
    const impactWords = ['impact', 'important', 'crucial', 'significant', 'outweigh', 'greater'];
    const hasImpact = impactWords.some(word => text.includes(word));
    
    // Logical fallacies detection (simplified)
    const fallacyPatterns = [
      { pattern: /\ball\b.*\balways\b/gi, name: 'overgeneralization' },
      { pattern: /\bstraw man\b/gi, name: 'straw man' },
      { pattern: /\bslippery slope\b/gi, name: 'slippery slope' }
    ];
    
    const logicalFallacies = fallacyPatterns.filter(fp => fp.pattern.test(text)).length;
    
    let baseScore = 35;
    if (hasStructure) baseScore += 20;
    if (hasExamples) baseScore += 15;
    if (hasImpact) baseScore += 15;
    if (fullText.split(' ').length > 150) baseScore += 10;
    
    return {
      baseScore,
      hasStructure,
      hasExamples,
      hasImpact,
      logicalFallacies,
      detailedFeedback: this.generateDetailedStrategyFeedback(hasStructure, hasExamples, hasImpact, logicalFallacies, role),
      specificStrengths: this.generateSpecificStrategyStrengths(hasStructure, hasExamples, hasImpact, fullText),
      specificImprovements: this.generateSpecificStrategyImprovements(hasStructure, hasExamples, hasImpact, role, fullText)
    };
  }

  // Detailed feedback generation methods
  private static generateDetailedContentFeedback(relevanceScore: number, argumentDepth: number, hasEvidence: boolean, role: string, fullText: string): string {
    const isFirstSpeaker = role.includes('1st Speaker');
    const isRebuttalSpeaker = role.includes('2nd Speaker') || role.includes('3rd Speaker');
    
    if (relevanceScore < 0.3) {
      if (isFirstSpeaker) {
        return `CRITICAL ISSUE: As 1st Speaker, your job is to FRAME the debate, not just talk randomly. You failed to establish any framework or criteria for judging. When discussing "${this.extractSampleTopic(fullText)}", you must connect it to the motion's central question and establish HOW judges should evaluate this debate. Use "We win this debate if..." and define key terms. Your current approach shows zero understanding of 1st Speaker responsibilities.`;
      } else if (isRebuttalSpeaker) {
        return `CRITICAL ISSUE: As ${role}, your PRIMARY job is to REBUT the opposition and EXTEND your side's case. You showed zero rebuttal skills - no "however," "they said," or "opposition claims." When discussing "${this.extractSampleTopic(fullText)}", you must directly engage with what opponents will say. Your current speech would be completely irrelevant in an actual debate.`;
      } else {
        return `CRITICAL ISSUE: Your content lacks relevance to the debate. You must directly address the motion's core question and provide arguments that judges can evaluate. Focus on establishing clear positions and supporting them with reasoning.`;
      }
    } else if (relevanceScore < 0.6) {
      if (isFirstSpeaker) {
        return `MODERATE FRAMING with significant gaps. As 1st Speaker, you're not just making points - you're building the foundation for your entire team. When you mention "${this.extractSamplePhrase(fullText)}", you must immediately explain how this establishes your framework and criteria. Every point should serve to set up the debate structure for your later speakers.`;
      } else if (isRebuttalSpeaker) {
        return `MODERATE REBUTTAL with significant gaps. As ${role}, you must balance rebuttal with extension. Your speech touches on relevant topics but lacks direct engagement with opposition arguments. You need more "They will argue X, but actually Y" and "Even if they're right about X, we still win because Z" structures.`;
      } else {
        return `MODERATE CONTENT with significant gaps. Your arguments need stronger connection to the motion and clearer reasoning. Focus on developing your points more thoroughly and providing deeper analysis.`;
      }
    } else if (argumentDepth < 2) {
      if (isFirstSpeaker) {
        return `GOOD FRAMEWORK but shallow argumentation. As 1st Speaker, you identified relevant themes but don't develop them with proper reasoning. For each framing point, use "Claim-Warrant-Impact" structure: make your claim about why your framework is best, provide reasoning, then explain strategic impact. Your arguments lack the "because" and "therefore" connections that make your framework persuasive.`;
      } else if (isRebuttalSpeaker) {
        return `GOOD REBUTTAL PREPARATION but shallow extension. As ${role}, you need to both refute opponents and build your side. Your current approach has potential rebuttal but lacks depth. For each point, use "They say X, but actually Y because Z" structure, then extend with "This matters because..."`;
      } else {
        return `GOOD CONTENT but shallow argumentation. You identified relevant themes but don't develop them with proper reasoning. Use "Claim-Warrant-Impact" structure: make your claim, provide reasoning, then explain impact. Your arguments lack the "because" and "therefore" connections that make them persuasive.`;
      }
    } else if (!hasEvidence) {
      if (isFirstSpeaker) {
        return `STRONG FRAMEWORK but missing evidentiary support. Your reasoning about how to frame the debate is sound, but as 1st Speaker, you need to back your framework with specific examples, statistics, or expert opinions. For instance, when establishing criteria, cite: "According to debate theory expert Smith, good frameworks must be fair, measurable, and comprehensive."`;
      } else if (isRebuttalSpeaker) {
        return `STRONG REBUTTAL LOGIC but missing evidentiary support. Your reasoning about how to counter opposition is good, but as ${role}, you need specific examples and data. Instead of just saying "their economic argument fails," say "In Country X, similar policies led to 3% GDP growth according to World Bank data, proving their economic claims wrong."`;
      } else {
        return `STRONG CONTENT but missing evidentiary support. Your reasoning is sound, but you need specific examples, statistics, or expert opinions to back your claims. Use evidence to make your arguments more persuasive and credible.`;
      }
    } else {
      if (isFirstSpeaker) {
        return `EXCELLENT CONTENT with strong relevance and argumentation. Your speech effectively addresses the motion with well-reasoned points and evidentiary support. As ${role}, you demonstrate good understanding of the debate's core tensions and maintain consistent thematic focus throughout.`;
      } else if (isRebuttalSpeaker) {
        return `EXCELLENT ${role} PERFORMANCE with strong rebuttal and extension skills. You effectively balance refutation of opposition with development of your side's case. Your approach demonstrates mastery of rebuttal speaker responsibilities - direct engagement, strategic extension, and impact analysis.`;
      } else {
        return `EXCELLENT CONTENT with strong relevance and argumentation. Your speech effectively addresses the motion with well-reasoned points and evidentiary support. You demonstrate good understanding of the debate's core tensions and maintain consistent thematic focus throughout.`;
      }
    }
    
    // Default return for any unhandled cases
    return `Your content shows mixed performance. As ${role}, focus on your specific responsibilities: ${isFirstSpeaker ? 'framework establishment and criteria definition' : 'direct rebuttal and strategic extension'}. Work on connecting your arguments to the central debate question and providing deeper analysis.`;
  }

  private static generateDetailedDeliveryFeedback(fillerRatio: number, pacingIssues: boolean, monotone: boolean, estimatedMinutes: number): string {
    const issues = [];
    if (fillerRatio > 0.15) issues.push(`excessive filler words (${Math.round(fillerRatio * 100)}% of your speech)`);
    if (pacingIssues) issues.push(estimatedMinutes < 4 ? 'speaking too quickly' : 'speaking too slowly');
    if (monotone) issues.push('monotone delivery');
    
    if (issues.length === 0) {
      return `STRONG DELIVERY with good pacing, minimal fillers, and vocal variety. Your speaking rate of approximately ${Math.round(estimatedMinutes * 60)} words per minute is ideal for debate, allowing judges to follow your arguments while maintaining engagement.`;
    }
    
    let feedback = `Your delivery needs significant improvement in several areas: ${issues.join(', ')}. `;
    
    if (fillerRatio > 0.15) {
      feedback += `Replace fillers with pauses - silence is more powerful than "um" or "like." Practice the "pause-think-speak" technique: pause briefly, formulate your thought, then speak clearly. `;
    }
    
    if (pacingIssues) {
      if (estimatedMinutes < 4) {
        feedback += `You're rushing through your content. Slow down during key points and use strategic pauses to let arguments land. Target 130-150 words per minute for optimal clarity. `;
      } else {
        feedback += `Your pace is too slow, which may lose judge attention. Increase your energy during important points and vary your speaking rate to maintain engagement. `;
      }
    }
    
    if (monotone) {
      feedback += `Use vocal variety - raise your pitch for emphasis, lower it for serious points, and vary your volume to signal importance changes. Practice reading with emotional expression to build this skill. `;
    }
    
    return feedback;
  }

  private static generateDetailedStrategyFeedback(hasStructure: boolean, hasExamples: boolean, hasImpact: boolean, logicalFallacies: number, role: string): string {
    const isFirstSpeaker = role.includes('1st Speaker');
    const isRebuttalSpeaker = role.includes('2nd Speaker') || role.includes('3rd Speaker');
    
    const issues = [];
    if (!hasStructure) issues.push('lacks clear speech structure');
    if (!hasExamples) issues.push('missing specific examples');
    if (!hasImpact) issues.push('fails to explain strategic importance');
    if (logicalFallacies > 0) issues.push(`${logicalFallacies} logical fallacy/fallacies`);
    
    if (issues.length === 0) {
      if (isFirstSpeaker) {
        return `EXCELLENT 1ST SPEAKER STRATEGY with proper framework establishment, structure, and impact analysis. Your speech demonstrates mastery of 1st Speaker responsibilities - setting up debate criteria, defining terms, and building foundation for your team's case.`;
      } else if (isRebuttalSpeaker) {
        return `EXCELLENT ${role} STRATEGY with proper rebuttal structure, examples, and impact analysis. Your speech demonstrates mastery of rebuttal speaker responsibilities - direct engagement with opposition, strategic extension, and effective weighing.`;
      } else {
        return `EXCELLENT STRATEGY with proper structure, examples, and impact analysis. Your speech demonstrates strong strategic thinking and effective debate techniques.`;
      }
    }
    
    let feedback = `Your strategic approach has critical weaknesses: ${issues.join(', ')}. `;
    
    if (!hasStructure) {
      if (isFirstSpeaker) {
        feedback += `As 1st Speaker, you must use "Framework-Structure" approach. Start with "Ladies and gentlemen, today's debate centers on..." then establish your judging criteria with "We win this debate if..." followed by your framework. Your structure should set up the entire debate for your team. `;
      } else if (isRebuttalSpeaker) {
        feedback += `As ${role}, you must use "Rebuttal-Extension" structure. Start with direct engagement: "They will argue X, but actually Y..." then extend your case with "This matters because..." End with strategic weighing. Your structure must balance refutation with development. `;
      }
    }
    
    if (!hasExamples) {
      if (isFirstSpeaker) {
        feedback += `As 1st Speaker, examples must support your FRAMEWORK. Instead of saying "this is important," say "According to debate theory expert Smith, frameworks must be fair, measurable, and comprehensive - our framework meets all three criteria." Use examples that establish your approach as superior. `;
      } else if (isRebuttalSpeaker) {
        feedback += `As ${role}, examples must support your REBUTTALS. Instead of saying "their economic argument fails," say "In Country X, similar policies led to 3% GDP growth according to World Bank data, proving their economic claims wrong." Use examples that specifically refute opposition. `;
      }
    }
    
    if (!hasImpact) {
      if (isFirstSpeaker) {
        feedback += `As 1st Speaker, you must explain why your FRAMEWORK matters strategically. Use the "So What?" test for your criteria: if you establish fairness as a criterion, immediately answer "so what?" - why does fairness matter more than their approach? Use weighing like "outweighs" and "more significant." `;
      } else if (isRebuttalSpeaker) {
        feedback += `As ${role}, you must explain why your REBUTTALS matter strategically. Use the "So What?" test for your refutations: if you prove their argument wrong, immediately answer "so what?" - why does this matter to the judge's decision? Use weighing like "outweighs" and "greater impact." `;
      }
    }
    
    if (logicalFallacies > 0) {
      feedback += `Logical fallacies undermine credibility regardless of your role. Avoid overgeneralizations and use precise language. Strong debaters use sound reasoning, not rhetorical shortcuts. `;
    }
    
    return feedback;
  }

  // Specific strengths and improvements
  private static generateSpecificContentStrengths(relevanceScore: number, argumentDepth: number, hasEvidence: boolean, fullText: string): string[] {
    const strengths = [];
    if (relevanceScore > 0.6) strengths.push('Strong thematic consistency with motion');
    if (argumentDepth >= 2) strengths.push('Good use of causal reasoning (because/therefore)');
    if (hasEvidence) strengths.push('Effective use of evidence/examples');
    if (fullText.includes('however') || fullText.includes('although')) strengths.push('Shows awareness of counterarguments');
    return strengths;
  }

  private static generateSpecificContentImprovements(relevanceScore: number, argumentDepth: number, hasEvidence: boolean, role: string, fullText: string): string[] {
    const isFirstSpeaker = role.includes('1st Speaker');
    const isRebuttalSpeaker = role.includes('2nd Speaker') || role.includes('3rd Speaker');
    
    const improvements = [];
    if (relevanceScore < 0.5) improvements.push(`Directly address the motion's core question in every point`);
    if (argumentDepth < 2) improvements.push('Use "Claim-Warrant-Impact" structure for each argument');
    if (!hasEvidence) improvements.push('Add specific examples, statistics, or expert opinions');
    
    if (isFirstSpeaker) {
      improvements.push('Establish clear framework for judging the debate');
      improvements.push('Use "We win this debate if..." criteria setting');
      improvements.push('Define key terms that favor your position');
      improvements.push('Build foundation for your team\'s later speakers');
      improvements.push('Use principled arguments to establish your framework');
    } else if (isRebuttalSpeaker) {
      improvements.push('Add direct rebuttal: "They will argue X, but actually Y..."');
      improvements.push('Use "Even if they\'re right about X, we still win because Z"');
      improvements.push('Extend your case beyond just refuting opponents');
      improvements.push('Preempt likely opposition arguments');
      improvements.push('Use comparative analysis to show why your approach is better');
    }
    
    if (!fullText.includes('however') && !fullText.includes('although')) {
      if (isRebuttalSpeaker) {
        improvements.push('Acknowledge and refute actual opposition arguments');
      } else {
        improvements.push('Acknowledge potential counterarguments to your framework');
      }
    }
    
    return improvements;
  }

  private static generateSpecificDeliveryStrengths(fillerRatio: number, pacingIssues: boolean, monotone: boolean): string[] {
    const strengths = [];
    if (fillerRatio < 0.08) strengths.push('Minimal use of filler words');
    if (!pacingIssues) strengths.push('Appropriate speaking pace for clarity');
    if (!monotone) strengths.push('Good vocal variety and expression');
    return strengths;
  }

  private static generateSpecificDeliveryImprovements(fillerRatio: number, pacingIssues: boolean, monotone: boolean, estimatedMinutes: number): string[] {
    const improvements = [];
    if (fillerRatio > 0.1) improvements.push('Replace "um/uh" with strategic pauses');
    if (estimatedMinutes < 4) improvements.push('Slow down during key points for emphasis');
    if (estimatedMinutes > 8) improvements.push('Increase energy and pace to maintain engagement');
    if (monotone) improvements.push('Practice vocal variation - pitch, pace, and volume');
    improvements.push('Record practice speeches to identify delivery patterns');
    return improvements;
  }

  private static generateSpecificStrategyStrengths(hasStructure: boolean, hasExamples: boolean, hasImpact: boolean, fullText: string): string[] {
    const strengths = [];
    if (hasStructure) strengths.push('Clear introduction-body-conclusion organization');
    if (hasExamples) strengths.push('Effective use of specific examples');
    if (hasImpact) strengths.push('Good strategic impact analysis');
    if (fullText.split(' ').length > 150) strengths.push('Appropriate speech length for development');
    return strengths;
  }

  private static generateSpecificStrategyImprovements(hasStructure: boolean, hasExamples: boolean, hasImpact: boolean, role: string, fullText: string): string[] {
    const improvements = [];
    if (!hasStructure) improvements.push('Use "Signposting" - "First, I will address... Second, I will examine... Finally, I will conclude..."');
    if (!hasExamples) improvements.push('Add concrete examples: "For instance, in Country X..."');
    if (!hasImpact) improvements.push('Use weighing mechanisms: "outweighs," "more significant," "greater impact"');
    if (role.includes('1st Speaker') && !fullText.includes('framework')) improvements.push('Establish judging criteria: "We win this debate if..."');
    if (!fullText.includes('however') && !fullText.includes('although')) improvements.push('Preempt counterarguments: "While some may argue..."');
    improvements.push('Use rhetorical devices: parallelism, analogies, and metaphors');
    return improvements;
  }

  // Helper methods
  private static extractSampleTopic(fullText: string): string {
    const sentences = fullText.split(/[.!?]/);
    return sentences.length > 2 ? sentences[1].trim().substring(0, 50) + '...' : 'main topic';
  }

  private static extractSamplePhrase(fullText: string): string {
    const words = fullText.split(' ');
    const start = Math.floor(words.length / 3);
    return words.slice(start, start + 8).join(' ') + '...';
  }

  private static generateRealisticSummary(contentScore: number, deliveryScore: number, strategyScore: number, role: string): string {
    const overall = Math.round((contentScore + deliveryScore + strategyScore) / 3);
    
    if (overall >= 80) {
      return `EXCELLENT PERFORMANCE as ${role}! You demonstrate strong debate fundamentals across all dimensions. Your content is relevant and well-reasoned, delivery is polished, and strategic choices are effective. With continued practice, you'll be a formidable debater.`;
    } else if (overall >= 60) {
      return `COMPETENT PERFORMANCE as ${role} with clear areas for improvement. You show understanding of debate basics but need refinement in content depth, delivery polish, and strategic sophistication. Focus on the specific feedback above to elevate your performance to the next level.`;
    } else if (overall >= 40) {
      return `DEVELOPING PERFORMANCE as ${role} that requires significant work. Your current approach lacks the rigor expected in competitive debate. Priority areas include improving content relevance, structural organization, and delivery fundamentals. Consistent practice with the specific techniques mentioned above is essential.`;
    } else {
      return `BEGINNING-LEVEL PERFORMANCE as ${role} that needs fundamental development. Your speech shows limited engagement with debate mechanics and requires substantial improvement in all areas. Focus first on basic structure, clear communication, and directly addressing the motion. Consider working with a debate coach to accelerate your progress.`;
    }
  }
}
