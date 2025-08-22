import { Injectable } from '@nestjs/common';

interface InitialScoreData {
  source?: string;
  hasEmail: boolean;
  hasPhone: boolean;
}

interface RecalculateScoreData {
  currentScore: number;
  stage: string;
  status: string;
  interactionCount: number;
}

@Injectable()
export class LeadScoringService {
  private readonly sourceScores: Record<string, number> = {
    'WEBSITE': 70,
    'REFERRAL': 85,
    'SOCIAL_MEDIA': 60,
    'ADVERTISEMENT': 55,
    'WALK_IN': 80,
    'PHONE_CALL': 75,
    'EMAIL': 65,
    'EVENT': 90,
    'PARTNER': 85,
    'OTHER': 50,
  };

  private readonly stageScores: Record<string, number> = {
    'INITIAL_CONTACT': 0,
    'QUALIFIED': 20,
    'INTERESTED': 40,
    'CONSIDERING': 60,
    'NEGOTIATING': 80,
    'ENROLLED': 100,
  };

  calculateInitialScore(data: InitialScoreData): number {
    let score = 0;

    // Source scoring (0-90 points)
    if (data.source) {
      score += this.sourceScores[data.source] || this.sourceScores['OTHER'];
    }

    // Contact information completeness (0-20 points)
    if (data.hasEmail) score += 10;
    if (data.hasPhone) score += 10;

    return Math.min(score, 100);
  }

  recalculateScore(data: RecalculateScoreData): number {
    let score = data.currentScore;

    // Stage progression bonus
    if (data.stage) {
      const stageScore = this.stageScores[data.stage] || 0;
      score = Math.max(score, stageScore);
    }

    // Engagement bonus (interaction count)
    const engagementBonus = Math.min(data.interactionCount * 2, 20);
    score += engagementBonus;

    // Status penalties
    if (data.status === 'INACTIVE') {
      score -= 30;
    } else if (data.status === 'LOST') {
      score -= 50;
    }

    return Math.max(0, Math.min(score, 100));
  }

  getScoreCategory(score: number): string {
    if (score >= 80) return 'HOT';
    if (score >= 60) return 'WARM';
    if (score >= 40) return 'COOL';
    return 'COLD';
  }

  getRecommendedActions(score: number, stage: string): string[] {
    const actions: string[] = [];
    const category = this.getScoreCategory(score);

    switch (category) {
      case 'HOT':
        actions.push('Schedule immediate follow-up call');
        actions.push('Prepare personalized proposal');
        actions.push('Arrange school visit');
        break;
      
      case 'WARM':
        actions.push('Send detailed information packet');
        actions.push('Invite to school events');
        actions.push('Schedule follow-up within 3 days');
        break;
      
      case 'COOL':
        actions.push('Add to email nurture campaign');
        actions.push('Send educational content');
        actions.push('Follow up in 1 week');
        break;
      
      case 'COLD':
        actions.push('Add to long-term nurture sequence');
        actions.push('Send occasional updates');
        actions.push('Re-engage in 1 month');
        break;
    }

    // Stage-specific actions
    if (stage === 'INITIAL_CONTACT') {
      actions.unshift('Qualify lead and gather requirements');
    } else if (stage === 'INTERESTED') {
      actions.unshift('Address any concerns or objections');
    } else if (stage === 'NEGOTIATING') {
      actions.unshift('Finalize terms and pricing');
    }

    return actions;
  }
}