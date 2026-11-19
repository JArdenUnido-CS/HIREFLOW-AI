/**
 * Phase 1: Candidate Profile Analysis
 * Calculates AI Scores from parsed resume data
 * Deterministic, rule-based weighted scoring
 */

import type { ParsedResume } from "../types/scoring";
import {
  extractExperienceText,
  countKeywordMatches,
  extractLargestNumericValue,
  calculateYearsBetween,
  extractSeniorityLevel,
  capScore,
  roundScore,
  calculateWeightedAverage,
  flattenSkills,
} from "./ScoringUtils";

export interface AIScores {
  overall: number;
  technical: number;
  experience: number;
  problemSolving: number;
  leadership: number;
  communication: number;
  teamwork: number;
  learningPotential: number;
  
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidenceLevel: number;
  
  calculatedAt: string;
  dataCompleteness: string;
}

export class CandidateAnalysisService {
  /**
   * Main entry point: Calculate all AI scores for a candidate
   */
  static calculateAIScores(parsedData: ParsedResume): AIScores {
    // Calculate individual dimension scores
    const technical = this.calculateTechnicalScore(parsedData);
    const experience = this.calculateExperienceScore(parsedData);
    const problemSolving = this.calculateProblemSolvingScore(parsedData);
    const leadership = this.calculateLeadershipScore(parsedData);
    const communication = this.calculateCommunicationScore(parsedData);
    const teamwork = this.calculateTeamworkScore(parsedData);
    const learningPotential = this.calculateLearningPotentialScore(parsedData);

    // Calculate overall score using weighted average
    const overall = roundScore(
      calculateWeightedAverage([
        { value: technical, weight: 0.22 },
        { value: experience, weight: 0.22 },
        { value: problemSolving, weight: 0.16 },
        { value: leadership, weight: 0.13 },
        { value: communication, weight: 0.13 },
        { value: teamwork, weight: 0.1 },
        { value: learningPotential, weight: 0.04 },
      ])
    );

    // Extract insights
    const strengths = this.extractStrengths(
      { technical, experience, leadership, communication, problemSolving, teamwork, learningPotential },
      parsedData
    );
    const weaknesses = this.extractWeaknesses(
      { technical, experience, leadership, communication, problemSolving, teamwork, learningPotential },
      parsedData
    );
    const recommendations = this.generateRecommendations(overall, strengths, weaknesses);
    const confidenceLevel = this.calculateConfidenceLevel(parsedData);
    const dataCompleteness = this.assessDataCompleteness(parsedData);

    return {
      overall: roundScore(overall),
      technical: roundScore(technical),
      experience: roundScore(experience),
      problemSolving: roundScore(problemSolving),
      leadership: roundScore(leadership),
      communication: roundScore(communication),
      teamwork: roundScore(teamwork),
      learningPotential: roundScore(learningPotential),
      strengths,
      weaknesses,
      recommendations,
      confidenceLevel,
      calculatedAt: new Date().toISOString(),
      dataCompleteness,
    };
  }

  // ========== DIMENSION SCORING FUNCTIONS ==========

  /**
   * Technical Score (0-100)
   * = (Skill Breadth × 0.40) + (Skill Depth × 0.35) + (Technical Projects × 0.25)
   */
  private static calculateTechnicalScore(parsedData: ParsedResume): number {
    const skillBreadth = this.calculateSkillBreadth(parsedData.skills);
    const skillDepth = this.calculateSkillDepth(parsedData.skills, parsedData.experience);
    const technicalProjects = this.calculateTechnicalProjects(parsedData.projects, parsedData.achievements);

    return capScore(
      skillBreadth * 0.4 + skillDepth * 0.35 + technicalProjects * 0.25
    );
  }

  /**
   * Skill Breadth: Unique technical skills / 15 × 100
   */
  private static calculateSkillBreadth(skills: Array<{ category: string; skills: string[] }>): number {
    const flatSkills = flattenSkills(skills);
    const unique = new Set(flatSkills).size;
    return capScore((unique / 15) * 100);
  }

  /**
   * Skill Depth: Average years per skill (vs 5 years = max)
   */
  private static calculateSkillDepth(
    skills: Array<{ category: string; skills: string[] }>,
    experience: Array<{ startDate: string; endDate: string | "Present"; description?: string[] }>
  ): number {
    const flatSkills = flattenSkills(skills);
    if (flatSkills.length === 0) return 0;

    const experienceText = extractExperienceText(experience);
    const skillMentions = new Map<string, number>();

    for (const skill of flatSkills) {
      const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, "gi");
      const matches = experienceText.match(regex) || [];
      skillMentions.set(skill, matches.length);
    }

    const totalMentions = Array.from(skillMentions.values()).reduce((a, b) => a + b, 0);
    const averageDepth = totalMentions / flatSkills.length;

    return capScore((averageDepth / 5) * 100);
  }

  /**
   * Technical Projects: (projects + achievements/2) / 4 × 100
   */
  private static calculateTechnicalProjects(
    projects: Array<{ technologies: string[] }>,
    achievements: string[]
  ): number {
    const projectCount = projects.length;
    
    const technicalAchievementKeywords = ["built", "developed", "engineered", "architected", "designed"];
    const technicalAchievements = achievements.filter((a) =>
      technicalAchievementKeywords.some((kw) => a.toLowerCase().includes(kw))
    ).length;

    const total = projectCount + technicalAchievements / 2;
    return capScore((total / 4) * 100);
  }

  /**
   * Experience Score (0-100)
   * = (Years of Experience × 0.50) + (Role Progression × 0.30) + (Achievement Count × 0.20)
   */
  private static calculateExperienceScore(parsedData: ParsedResume): number {
    const yearsScore = this.calculateYearsScore(parsedData.totalYearsExperience);
    const progressionScore = this.calculateRoleProgressionScore(parsedData.experience);
    const achievementScore = this.calculateAchievementCountScore(parsedData.achievements);

    return capScore(
      yearsScore * 0.5 + progressionScore * 0.3 + achievementScore * 0.2
    );
  }

  /**
   * Years Score: (years / 12) × 100
   */
  private static calculateYearsScore(totalYears: number): number {
    return capScore((totalYears / 12) * 100);
  }

  /**
   * Role Progression Score: Detect career progression through job titles
   */
  private static calculateRoleProgressionScore(
    experience: Array<{ title: string }>
  ): number {
    if (experience.length === 0) return 0;
    if (experience.length === 1) {
      const level = extractSeniorityLevel(experience[0].title);
      return level * 25; // 0-100
    }

    // Multiple roles: calculate progression
    const currentLevel = extractSeniorityLevel(experience[0].title);
    const previousMaxLevel = Math.max(
      ...experience.slice(1).map((exp) => extractSeniorityLevel(exp.title))
    );

    if (currentLevel > previousMaxLevel) {
      const progressionGap = currentLevel - previousMaxLevel;
      return capScore(previousMaxLevel * 25 + progressionGap * 25 * 1.5);
    }

    return currentLevel * 25;
  }

  /**
   * Achievement Count Score: (count / 4) × 100
   */
  private static calculateAchievementCountScore(achievements: string[]): number {
    return capScore((achievements.length / 4) * 100);
  }

  /**
   * Problem Solving Score (0-100)
   * = (Challenging Projects × 0.40) + (Optimization Indicators × 0.35) + (Scale Indicators × 0.25)
   */
  private static calculateProblemSolvingScore(parsedData: ParsedResume): number {
    const challengingScore = this.calculateChallengingProjectsScore(
      parsedData.projects,
      parsedData.experience
    );
    const optimizationScore = this.calculateOptimizationIndicatorsScore(parsedData.experience);
    const scaleScore = this.calculateScaleIndicatorsScore(parsedData.experience, parsedData.projects);

    return capScore(
      challengingScore * 0.4 + optimizationScore * 0.35 + scaleScore * 0.25
    );
  }

  /**
   * Challenging Projects: (projects + job mentions) / 3 × 100
   */
  private static calculateChallengingProjectsScore(
    projects: Array<{ description: string }>,
    experience: Array<{ description?: string[] }>
  ): number {
    const keywords = ["algorithm", "optimization", "scalability", "performance", "complex", "architecture", "system design", "challenge"];
    
    let challengingProjects = 0;
    for (const project of projects) {
      if (keywords.some((kw) => project.description.toLowerCase().includes(kw))) {
        challengingProjects++;
      }
    }

    const experienceText = extractExperienceText(experience);
    const matches = countKeywordMatches(experienceText, keywords);
    const challengingJobs = matches.length;

    const total = challengingProjects + challengingJobs / 2;
    return capScore((total / 3) * 100);
  }

  /**
   * Optimization Indicators: Mentions of optimization work / 3 × 100
   */
  private static calculateOptimizationIndicatorsScore(
    experience: Array<{ description?: string[] }>
  ): number {
    const keywords = ["reduced latency", "improved performance", "scaled", "optimized", "efficiency", "throughput", "faster"];
    const experienceText = extractExperienceText(experience);
    const matches = countKeywordMatches(experienceText, keywords);
    const mentions = matches.length;

    return capScore((mentions / 3) * 100);
  }

  /**
   * Scale Indicators: Largest scale mentioned / 1000 × 100
   * Searches both experience descriptions and project descriptions for numeric scale evidence
   */
  private static calculateScaleIndicatorsScore(
    experience: Array<{ description?: string[] }>,
    projects: Array<{ description: string }>
  ): number {
    const experienceText = extractExperienceText(experience);
    const projectsText = projects.map((p) => p.description).join(" ");
    const combinedText = experienceText + " " + projectsText;
    const maxScale = extractLargestNumericValue(combinedText);

    if (maxScale === 0) return 30; // Baseline for having no scale metrics

    return capScore((maxScale / 1000) * 100);
  }

  /**
   * Leadership Score (0-100)
   * = (Leadership Titles × 0.45) + (Mentoring Indicators × 0.35) + (Influence Indicators × 0.20)
   */
  private static calculateLeadershipScore(parsedData: ParsedResume): number {
    const titlesScore = this.calculateLeadershipTitlesScore(parsedData.experience);
    const mentoringScore = this.calculateMentoringIndicatorsScore(
      parsedData.experience,
      parsedData.achievements
    );
    const influenceScore = this.calculateInfluenceIndicatorsScore(
      parsedData.achievements,
      parsedData.projects
    );

    return capScore(
      titlesScore * 0.45 + mentoringScore * 0.35 + influenceScore * 0.2
    );
  }

  /**
   * Leadership Titles: Ratio of leadership titles to total roles
   */
  private static calculateLeadershipTitlesScore(
    experience: Array<{ title: string }>
  ): number {
    if (experience.length === 0) return 0;

    const leadKeywords = ["lead", "manager", "director", "principal", "head", "cto", "vp"];
    const leadershipCount = experience.filter((exp) =>
      leadKeywords.some((kw) => exp.title.toLowerCase().includes(kw))
    ).length;

    return (leadershipCount / experience.length) * 100;
  }

  /**
   * Mentoring Indicators: Mentions of mentoring / 2 × 100
   */
  private static calculateMentoringIndicatorsScore(
    experience: Array<{ description?: string[] }>,
    achievements: string[]
  ): number {
    const keywords = ["mentor", "mentored", "coached", "guided", "trained", "led team", "managed", "direct report"];
    
    const experienceText = extractExperienceText(experience);
    const achievementsText = achievements.join(" ");
    const fullText = experienceText + " " + achievementsText;

    const matches = countKeywordMatches(fullText, keywords);
    const mentions = matches.length;

    return capScore((mentions / 2) * 100);
  }

  /**
   * Influence Indicators: Mentions of driving initiatives
   */
  private static calculateInfluenceIndicatorsScore(
    achievements: string[],
    projects: Array<{ url?: string }>
  ): number {
    const keywords = ["led", "spearheaded", "drove", "championed", "initiated", "founded", "established", "launched"];
    
    const achievementsText = achievements.join(" ");
    const matches = countKeywordMatches(achievementsText, keywords);
    let mentions = matches.length;

    // Bonus for open source projects
    const hasOpenSource = projects.some((p) => p.url?.includes("github"));
    if (hasOpenSource) mentions += 1;

    return capScore((mentions / 2) * 100 + (hasOpenSource ? 20 : 0));
  }

  /**
   * Communication Score (0-100)
   * = (Speaking Indicators × 0.35) + (Writing Indicators × 0.40) + (Presentation Materials × 0.25)
   */
  private static calculateCommunicationScore(parsedData: ParsedResume): number {
    const speakingScore = this.calculateSpeakingIndicatorsScore(parsedData.achievements);
    const writingScore = this.calculateWritingIndicatorsScore(
      parsedData.achievements,
      parsedData.projects
    );
    const materialsScore = this.calculatePresentationMaterialsScore(
      parsedData.projects,
      parsedData.github || undefined
    );

    return capScore(
      speakingScore * 0.35 + writingScore * 0.4 + materialsScore * 0.25
    );
  }

  /**
   * Speaking Indicators: Conference talks, presentations / 2 × 100
   */
  private static calculateSpeakingIndicatorsScore(achievements: string[]): number {
    const keywords = ["speaker", "presented", "talk", "conference", "keynote", "panelist", "spoke at"];
    const matches = countKeywordMatches(achievements.join(" "), keywords);
    const mentions = matches.length;

    if (mentions === 0) return 20; // Baseline
    return capScore((mentions / 2) * 100);
  }

  /**
   * Writing Indicators: Blog, articles, documentation / 2 × 100
   */
  private static calculateWritingIndicatorsScore(
    achievements: string[],
    projects: Array<{ description: string }>
  ): number {
    const keywords = ["blog", "published", "article", "documentation", "wrote", "technical writing", "author"];
    
    const text = [...achievements, ...projects.map((p) => p.description)].join(" ");
    const matches = countKeywordMatches(text, keywords);
    const mentions = matches.length;

    if (mentions === 0) return 25; // Baseline
    return capScore((mentions / 2) * 100);
  }

  /**
   * Presentation Materials: GitHub, portfolio, documentation
   */
  private static calculatePresentationMaterialsScore(
    projects: Array<{ url?: string; description?: string | string[] }>,
    github?: string
  ): number {
    let score = 0;

    // GitHub projects
    const hasGitHub = projects.some((p) => p.url?.includes("github")) || !!github;
    if (hasGitHub) score += 30;

    // Portfolio or personal projects
    if (projects.length > 0) score += 20;

    // Well-documented projects (assume projects with long descriptions are documented)
    const wellDocumented = projects.some((p) => {
      if (!p.description) return false;
      const desc = typeof p.description === 'string' ? p.description : (p.description as string[]).join(' ');
      return desc.length > 50;
    });
    if (wellDocumented) score += 20;

    // LinkedIn/other profiles (inferred from having multiple contact points)
    if (projects.length > 0 || github) score += 15;

    return capScore(score);
  }

  /**
   * Teamwork Score (0-100)
   * = (Company Diversity × 0.35) + (Collaborative Projects × 0.40) + (Recognition × 0.25)
   */
  private static calculateTeamworkScore(parsedData: ParsedResume): number {
    const diversityScore = this.calculateCompanyDiversityScore(parsedData.experience);
    const collaborativeScore = this.calculateCollaborativeProjectsScore(
      parsedData.experience,
      parsedData.projects
    );
    const recognitionScore = this.calculateRecognitionIndicatorsScore(parsedData.achievements);

    return capScore(
      diversityScore * 0.35 + collaborativeScore * 0.4 + recognitionScore * 0.25
    );
  }

  /**
   * Company Diversity: Unique companies / 5 × 100
   */
  private static calculateCompanyDiversityScore(
    experience: Array<{ company: string }>
  ): number {
    const unique = new Set(experience.map((e) => e.company)).size;
    let score = (unique / 5) * 100;

    // Loyalty bonus for single company with multiple years
    if (unique === 1 && experience.length >= 2) {
      score += 20;
    }

    return capScore(score);
  }

  /**
   * Collaborative Projects: Cross-team work mentions / 4 × 100
   */
  private static calculateCollaborativeProjectsScore(
    experience: Array<{ description?: string[] }>,
    projects: Array<unknown>
  ): number {
    const keywords = ["cross-team", "collaborated", "coordinated", "partnered", "worked with", "cross-functional"];
    const experienceText = extractExperienceText(experience);
    const matches = countKeywordMatches(experienceText, keywords);

    const total = matches.length + projects.length / 2;
    return capScore((total / 4) * 100);
  }

  /**
   * Recognition Indicators: Awards, recognition mentions / 2 × 100
   */
  private static calculateRecognitionIndicatorsScore(achievements: string[]): number {
    const keywords = ["award", "recognition", "honored", "selected", "finalist", "best", "spotlight"];
    const matches = countKeywordMatches(achievements.join(" "), keywords);
    const mentions = matches.length;

    if (mentions === 0) return 30; // Baseline
    return capScore((mentions / 2) * 100);
  }

  /**
   * Learning Potential Score (0-100)
   * = (Career Transitions × 0.30) + (Skill Diversity × 0.35) + (Certifications × 0.35)
   */
  private static calculateLearningPotentialScore(parsedData: ParsedResume): number {
    const transitionsScore = this.calculateCareerTransitionsScore(parsedData.experience);
    const diversityScore = this.calculateSkillDiversityScore(parsedData.skills);
    const certificationsScore = this.calculateCertificationsScore(parsedData.certifications);

    return capScore(
      transitionsScore * 0.3 + diversityScore * 0.35 + certificationsScore * 0.35
    );
  }

  /**
   * Career Transitions: Different job types / types
   */
  private static calculateCareerTransitionsScore(
    experience: Array<{ title: string }>
  ): number {
    if (experience.length === 0) return 0;

    // Categorize into domain types
    const domains = new Set<string>();
    for (const exp of experience) {
      const domain = this.categorizeJobDomain(exp.title);
      domains.add(domain);
    }

    const distinctTypes = domains.size;
    if (distinctTypes >= 3) return 100;
    if (distinctTypes === 2) return 60;
    return 30;
  }

  /**
   * Helper: Categorize job domain
   */
  private static categorizeJobDomain(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes("frontend") || lower.includes("react") || lower.includes("vue")) return "Frontend";
    if (lower.includes("backend") || lower.includes("server") || lower.includes("node")) return "Backend";
    if (lower.includes("full")) return "Full-stack";
    if (lower.includes("manager") || lower.includes("lead")) return "Management";
    if (lower.includes("ml") || lower.includes("machine learning")) return "ML";
    return "Other";
  }

  /**
   * Skill Diversity: Distinct categories / 6 × 100
   */
  private static calculateSkillDiversityScore(
    skills: Array<{ category: string }>
  ): number {
    const categories = new Set(skills.map((s) => s.category));
    return capScore((categories.size / 6) * 100);
  }

  /**
   * Certifications Score: (count / 3) × 100
   */
  private static calculateCertificationsScore(certifications: string[]): number {
    return capScore((certifications.length / 3) * 100);
  }

  // ========== INSIGHT EXTRACTION ==========

  /**
   * Extract strengths based on high-scoring dimensions
   */
  private static extractStrengths(
    scores: Record<string, number>,
    parsedData: ParsedResume
  ): string[] {
    const strengths: string[] = [];

    if (scores.technical > 80) {
      strengths.push("Exceptional technical expertise across multiple areas");
    }

    if (scores.experience > 80) {
      strengths.push("Extensive industry experience at senior level");
    }

    if (scores.problemSolving > 85) {
      strengths.push("Strong problem-solving and optimization mindset");
    }

    if (scores.leadership > 75) {
      strengths.push("Demonstrated leadership and team development");
    }

    if (scores.communication > 85) {
      strengths.push("Excellent communication and presentation skills");
    }

    // Domain-specific insights
    const topSkills = flattenSkills(parsedData.skills).slice(0, 3);
    if (topSkills.length > 0) {
      strengths.push(`Deep expertise in ${topSkills.join(", ")}`);
    }

    return strengths.slice(0, 3); // Limit to 3
  }

  /**
   * Extract weaknesses based on low-scoring dimensions
   */
  private static extractWeaknesses(
    scores: Record<string, number>,
    parsedData: ParsedResume
  ): string[] {
    const weaknesses: string[] = [];

    if (scores.experience < 50 && parsedData.totalYearsExperience < 3) {
      weaknesses.push("Limited industry experience (less than 3 years)");
    }

    if (scores.leadership < 40) {
      weaknesses.push("No formal leadership experience yet");
    }

    if (scores.communication < 50) {
      weaknesses.push("Limited evidence of public communication or writing");
    }

    if (scores.learningPotential < 40) {
      weaknesses.push("Narrow skill diversity limits adaptability");
    }

    if (scores.teamwork < 50) {
      weaknesses.push("Limited collaborative project history");
    }

    return weaknesses.slice(0, 2); // Limit to 2
  }

  /**
   * Generate hiring recommendations
   */
  private static generateRecommendations(
    overall: number,
    strengths: string[],
    weaknesses: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (overall >= 85) {
      recommendations.push("Exceptional candidate - strong hire");
    } else if (overall >= 75) {
      recommendations.push("Strong candidate - excellent technical fit");
    } else if (overall >= 60) {
      recommendations.push("Solid candidate - consider for role");
    } else {
      recommendations.push("Review carefully - may need additional training");
    }

    if (strengths.includes("Demonstrated leadership and team development")) {
      recommendations.push("Consider for technical leadership roles");
    }

    if (
      weaknesses.some((w) => w.includes("Limited industry experience")) &&
      overall > 70
    ) {
      recommendations.push("Strong growth potential despite experience gap");
    }

    return recommendations.slice(0, 2); // Limit to 2
  }

  /**
   * Calculate confidence level based on data completeness
   */
  private static calculateConfidenceLevel(parsedData: ParsedResume): number {
    let score = 0;

    // Check for required fields
    if (parsedData.summary) score += 15;
    if (parsedData.experience && parsedData.experience.length > 0) score += 20;
    if (parsedData.education && parsedData.education.length > 0) score += 15;
    if (parsedData.skills && parsedData.skills.length > 0) score += 15;
    if (parsedData.certifications && parsedData.certifications.length > 0) score += 10;
    if (parsedData.projects && parsedData.projects.length > 0) score += 10;
    if (parsedData.achievements && parsedData.achievements.length > 0) score += 15;

    return capScore(score);
  }

  /**
   * Assess data completeness description
   */
  private static assessDataCompleteness(parsedData: ParsedResume): string {
    const fields: (keyof ParsedResume)[] = [
      "summary",
      "experience",
      "education",
      "skills",
      "certifications",
      "projects",
      "achievements",
    ];

    const present = fields.filter((f) => {
      const val = parsedData[f];
      if (Array.isArray(val)) return val.length > 0;
      return !!val;
    }).length;

    if (present === fields.length) return "All fields present";
    if (present >= 5) return "Most fields present";
    if (present >= 3) return "Some fields present";
    return "Limited data available";
  }
}
