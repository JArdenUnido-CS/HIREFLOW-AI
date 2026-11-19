/**
 * Phase 2: Candidate-Job Matching
 * Calculates Match Scores from candidate data and job requirements
 * Deterministic, rule-based weighted scoring
 */

import type { ParsedResume } from "../types/scoring";
import {
  flattenSkills,
  findMatchingSkills,
  extractExperienceText,
  countKeywordMatches,
  extractSeniorityLevel,
  parseEducationRequirement,
  parseCandidateDegree,
  calculateInstitutionPrestige,
  calculateLocationMatch,
  capScore,
  roundScore,
  calculateWeightedAverage,
} from "./ScoringUtils";

export interface JobRequirements {
  skillsRequired: string[];
  skillsPreferred: string[];
  experienceYears: number;
  education: string | null;
  location: string;
  type: string;
}

export interface MatchScores {
  overall: number;
  technical: number;
  experience: number;
  education: number;
  skills: number;
  certification: number;
  location: number;
  
  classification: string;
  explanations: Record<string, string>;
  missingSkills: string[];
  
  matchedAt: string;
}

export class JobMatchingService {
  /**
   * Main entry point: Calculate all match scores for a candidate against a job
   */
  static calculateMatchScores(
    parsedData: ParsedResume,
    job: JobRequirements
  ): MatchScores {
    // Calculate individual criterion scores
    const skillsScore = this.calculateSkillsMatchScore(
      parsedData.skills,
      parsedData.experience,
      job.skillsRequired,
      job.skillsPreferred
    );
    const experienceScore = this.calculateExperienceMatchScore(
      parsedData.totalYearsExperience,
      parsedData.experience,
      job.experienceYears
    );
    const educationScore = this.calculateEducationMatchScore(
      parsedData.education,
      job.education
    );
    const certificationScore = this.calculateCertificationMatchScore(
      parsedData.certifications,
      job
    );
    const locationScore = this.calculateLocationMatchScore(
      parsedData,
      job
    );

    // Calculate overall match using weighted average
    const overall = roundScore(
      calculateWeightedAverage([
        { value: skillsScore, weight: 0.35 },
        { value: experienceScore, weight: 0.3 },
        { value: educationScore, weight: 0.2 },
        { value: certificationScore, weight: 0.1 },
        { value: locationScore, weight: 0.05 },
      ])
    );

    // Identify missing skills
    const candidateSkills = flattenSkills(parsedData.skills);
    const missingSkills = job.skillsRequired.filter(
      (req) => !findMatchingSkills([req], candidateSkills).length
    );

    // Generate explanations
    const explanations = this.generateExplanations(
      {
        skillsScore,
        experienceScore,
        educationScore,
        certificationScore,
        locationScore,
      },
      parsedData,
      job,
      missingSkills
    );

    // Classify match
    const classification = this.classifyMatch(overall);

    return {
      overall: roundScore(overall),
      technical: roundScore(skillsScore),
      experience: roundScore(experienceScore),
      education: roundScore(educationScore),
      skills: roundScore(skillsScore),
      certification: roundScore(certificationScore),
      location: roundScore(locationScore),
      classification,
      explanations,
      missingSkills,
      matchedAt: new Date().toISOString(),
    };
  }

  // ========== CRITERION SCORING FUNCTIONS ==========

  /**
   * Skills Match Score (0-100)
   * = (Required Coverage × 0.60) + (Preferred Coverage × 0.25) + (Recency × 0.15)
   */
  private static calculateSkillsMatchScore(
    candidateSkills: Array<{ category: string; skills: string[] }>,
    experience: Array<{ description?: string[]; startDate: string; endDate: string | "Present" }>,
    requiredSkills: string[],
    preferredSkills: string[]
  ): number {
    const flatSkills = flattenSkills(candidateSkills);

    const requiredCoverage = this.calculateRequiredSkillsCoverage(
      flatSkills,
      requiredSkills
    );
    const preferredCoverage = this.calculatePreferredSkillsCoverage(
      flatSkills,
      preferredSkills
    );
    const recencyScore = this.calculateSkillRecencyScore(
      flatSkills,
      experience,
      requiredSkills
    );

    return capScore(
      requiredCoverage * 0.6 + preferredCoverage * 0.25 + recencyScore * 0.15
    );
  }

  /**
   * Required Skills Coverage: (matched / required) × 100
   */
  private static calculateRequiredSkillsCoverage(
    candidateSkills: string[],
    requiredSkills: string[]
  ): number {
    if (requiredSkills.length === 0) return 50; // Neutral if no requirements

    const matched = findMatchingSkills(requiredSkills, candidateSkills);
    return (matched.length / requiredSkills.length) * 100;
  }

  /**
   * Preferred Skills Coverage: (matched / preferred) × 100
   */
  private static calculatePreferredSkillsCoverage(
    candidateSkills: string[],
    preferredSkills: string[]
  ): number {
    if (!preferredSkills || preferredSkills.length === 0) return 50; // Neutral

    const matched = findMatchingSkills(preferredSkills, candidateSkills);
    return (matched.length / preferredSkills.length) * 100;
  }

  /**
   * Skill Recency: How recently were required skills used
   */
  private static calculateSkillRecencyScore(
    candidateSkills: string[],
    experience: Array<{ description?: string[]; startDate: string; endDate: string | "Present" }>,
    requiredSkills: string[]
  ): number {
    if (requiredSkills.length === 0) return 100;

    let totalRecency = 0;
    const matchedSkills = findMatchingSkills(requiredSkills, candidateSkills);

    for (const skill of matchedSkills) {
      let recency = 0;

      // Check most recent job
      if (experience.length > 0) {
        const mostRecentDesc = experience[0].description?.join(" ").toLowerCase() || "";
        if (mostRecentDesc.includes(skill.toLowerCase())) {
          recency = 100;
        } else if (experience.length > 1) {
          // Check 2nd most recent
          const secondDesc = experience[1].description?.join(" ").toLowerCase() || "";
          if (secondDesc.includes(skill.toLowerCase())) {
            recency = 75;
          } else {
            recency = 50; // Found in older roles
          }
        } else {
          recency = 50;
        }
      }

      totalRecency += recency;
    }

    if (matchedSkills.length === 0) return 50;
    return totalRecency / matchedSkills.length;
  }

  /**
   * Experience Match Score (0-100)
   * = (Years Fit × 0.50) + (Seniority Fit × 0.35) + (Domain Fit × 0.15)
   */
  private static calculateExperienceMatchScore(
    totalYears: number,
    experience: Array<{ title: string }>,
    requiredYears: number
  ): number {
    const yearsScore = this.calculateYearsFitScore(totalYears, requiredYears);
    const seniorityScore = this.calculateSeniorityFitScore(experience, requiredYears);
    const domainScore = this.calculateDomainFitScore(experience);

    return capScore(
      yearsScore * 0.5 + seniorityScore * 0.35 + domainScore * 0.15
    );
  }

  /**
   * Years Fit: Comparison to required years
   */
  private static calculateYearsFitScore(
    candidateYears: number,
    requiredYears: number
  ): number {
    if (candidateYears >= requiredYears) {
      // Bonus for exceeding by up to 10%
      const bonus = Math.min(10, ((candidateYears - requiredYears) / requiredYears) * 10);
      return capScore(100 + bonus);
    }

    if (candidateYears >= requiredYears * 0.8) return 90;
    if (candidateYears >= requiredYears * 0.6) return 70;
    if (candidateYears >= requiredYears * 0.4) return 50;

    return Math.max(20, (candidateYears / requiredYears) * 50);
  }

  /**
   * Seniority Fit: Current role vs requirement
   */
  private static calculateSeniorityFitScore(
    experience: Array<{ title: string }>,
    requiredYears: number
  ): number {
    if (experience.length === 0) return 30;

    // Infer job seniority requirement
    let jobSeniority = 2; // Default to mid-level
    if (requiredYears >= 7) jobSeniority = 3; // Senior
    if (requiredYears >= 12) jobSeniority = 4; // Principal

    const candidateSeniority = extractSeniorityLevel(experience[0].title);

    if (candidateSeniority >= jobSeniority) return 100;
    if (candidateSeniority === jobSeniority - 1) return 75;
    if (candidateSeniority === jobSeniority - 2) return 50;

    return Math.max(20, (candidateSeniority / jobSeniority) * 100);
  }

  /**
   * Domain Fit: Current domain expertise
   */
  private static calculateDomainFitScore(
    experience: Array<{ title: string }>
  ): number {
    if (experience.length === 0) return 40;

    // Infer primary domain from current role
    const currentRole = experience[0].title.toLowerCase();
    let candidateDomain = "Other";

    if (
      currentRole.includes("frontend") ||
      currentRole.includes("react") ||
      currentRole.includes("vue")
    ) {
      candidateDomain = "Frontend";
    } else if (
      currentRole.includes("backend") ||
      currentRole.includes("node") ||
      currentRole.includes("python")
    ) {
      candidateDomain = "Backend";
    } else if (currentRole.includes("full")) {
      candidateDomain = "Full-stack";
    } else if (currentRole.includes("ml") || currentRole.includes("machine")) {
      candidateDomain = "ML";
    }

    // Check if all experience is in same domain
    const allRoles = experience.map((e) => e.title.toLowerCase());
    const allSameDomain = allRoles.every(
      (role) =>
        candidateDomain === "Full-stack" ||
        (candidateDomain === "Frontend" &&
          (role.includes("frontend") || role.includes("react"))) ||
        (candidateDomain === "Backend" &&
          (role.includes("backend") || role.includes("node")))
    );

    if (allSameDomain) return 100;
    return 70; // Some domain experience
  }

  /**
   * Education Match Score (0-100)
   * = (Degree Match × 0.60) + (Field Match × 0.30) + (Institution Prestige × 0.10)
   */
  private static calculateEducationMatchScore(
    candidateEducation: Array<{ degree: string; field: string; institution: string }>,
    jobEducation: string | null
  ): number {
    const degreeScore = this.calculateDegreeMatchScore(
      candidateEducation,
      jobEducation
    );
    const fieldScore = this.calculateFieldMatchScore(
      candidateEducation,
      jobEducation
    );
    const prestigeScore = this.calculateInstitutionPrestigeMatchScore(
      candidateEducation
    );

    return capScore(
      degreeScore * 0.6 + fieldScore * 0.3 + prestigeScore * 0.1
    );
  }

  /**
   * Degree Match: Compare education levels
   */
  private static calculateDegreeMatchScore(
    candidateEducation: Array<{ degree: string }>,
    jobEducation: string | null
  ): number {
    if (!jobEducation) return 100; // No requirement

    if (candidateEducation.length === 0) return 25; // No degree listed

    const requiredLevel = parseEducationRequirement(jobEducation);
    const candidateHighestDegree = candidateEducation[0];
    const candidateLevel = parseCandidateDegree(candidateHighestDegree.degree);

    if (candidateLevel >= requiredLevel) return 100;
    if (candidateLevel === requiredLevel - 1) return 75;
    if (candidateLevel >= 2) return 50; // Some college education
    return 25;
  }

  /**
   * Field Match: Compare education fields
   */
  private static calculateFieldMatchScore(
    candidateEducation: Array<{ field: string }>,
    jobEducation: string | null
  ): number {
    if (!jobEducation) return 50; // Neutral

    if (candidateEducation.length === 0) return 30;

    // Extract required field
    let requiredField = "";
    if (jobEducation.includes("Computer Science")) requiredField = "Computer Science";
    else if (jobEducation.includes("Engineering")) requiredField = "Engineering";
    else if (jobEducation.includes("Mathematics")) requiredField = "Mathematics";
    else if (jobEducation.includes("Physics")) requiredField = "Physics";

    if (!requiredField) return 50; // No specific field requirement

    const candidateField = candidateEducation[0].field;

    // Exact match
    if (candidateField.toLowerCase().includes(requiredField.toLowerCase())) {
      return 100;
    }

    // Related fields
    const relatedPairs: [string, string][] = [
      ["Computer Science", "Engineering"],
      ["Mathematics", "Physics"],
      ["Business", "Economics"],
    ];

    for (const [field1, field2] of relatedPairs) {
      if (
        (requiredField.includes(field1) && candidateField.includes(field2)) ||
        (requiredField.includes(field2) && candidateField.includes(field1))
      ) {
        return 80;
      }
    }

    return 30;
  }

  /**
   * Institution Prestige Match: Score based on institution
   */
  private static calculateInstitutionPrestigeMatchScore(
    candidateEducation: Array<{ institution: string }>
  ): number {
    if (candidateEducation.length === 0) return 30;

    return calculateInstitutionPrestige(candidateEducation[0].institution);
  }

  /**
   * Certification Match Score (0-100)
   * Based on whether candidate has job-relevant certifications
   */
  private static calculateCertificationMatchScore(
    candidateCerts: string[],
    job: JobRequirements
  ): number {
    // Infer relevant certifications from job title/type
    const relevantCerts: string[] = [];

    if (job.skillsRequired?.some((s) => s.toLowerCase().includes("aws"))) {
      relevantCerts.push("AWS Certified");
    }
    if (job.skillsRequired?.some((s) => s.toLowerCase().includes("kubernetes"))) {
      relevantCerts.push("CKA", "CKAD");
    }
    if (job.skillsRequired?.some((s) => s.toLowerCase().includes("cloud"))) {
      relevantCerts.push("Cloud");
    }

    if (relevantCerts.length === 0) return 50; // No specific requirement

    const matched = candidateCerts.filter((cert) =>
      relevantCerts.some((req) => cert.toLowerCase().includes(req.toLowerCase()))
    );

    if (matched.length === 0) {
      // Partial credit for having any certifications
      return candidateCerts.length > 0 ? 30 : 0;
    }

    return (matched.length / relevantCerts.length) * 100;
  }

  /**
   * Location Match Score (0-100)
   */
  private static calculateLocationMatchScore(
    parsedData: ParsedResume,
    job: JobRequirements
  ): number {
    const candidateLocation = parsedData.location || "Unknown";
    return calculateLocationMatch(candidateLocation, job.location, job.type);
  }

  // ========== CLASSIFICATION & EXPLANATIONS ==========

  /**
   * Classify match based on overall score
   */
  private static classifyMatch(score: number): string {
    if (score >= 85) return "Excellent Match";
    if (score >= 75) return "Good Match";
    if (score >= 60) return "Potential Match";
    if (score >= 45) return "Below Target";
    return "Poor Match";
  }

  /**
   * Generate human-readable explanations for each criterion
   */
  private static generateExplanations(
    scores: Record<string, number>,
    parsedData: ParsedResume,
    job: JobRequirements,
    missingSkills: string[]
  ): Record<string, string> {
    const explanations: Record<string, string> = {};

    // Skills explanation
    const candidateSkills = flattenSkills(parsedData.skills);
    const matchedRequired = findMatchingSkills(job.skillsRequired, candidateSkills);
    explanations.skills = `Matches ${matchedRequired.length}/${job.skillsRequired.length} required skills (${matchedRequired.join(", ")}).${
      missingSkills.length > 0 ? ` Missing: ${missingSkills.join(", ")}.` : ""
    }`;

    // Experience explanation
    const yearsMatch = parsedData.totalYearsExperience >= job.experienceYears ? "exceeds" : "is below";
    explanations.experience = `${parsedData.totalYearsExperience.toFixed(1)} years ${yearsMatch} ${job.experienceYears}-year requirement.`;

    // Education explanation
    if (parsedData.education.length === 0) {
      explanations.education = "No formal education listed.";
    } else {
      const candidateDegree = parsedData.education[0].degree;
      const candidateField = parsedData.education[0].field;
      explanations.education = `${candidateDegree} in ${candidateField} from ${parsedData.education[0].institution}.`;
    }

    // Certification explanation
    explanations.certification = parsedData.certifications.length > 0
      ? `Has ${parsedData.certifications.length} certification(s): ${parsedData.certifications.join(", ")}`
      : "No certifications listed.";

    // Location explanation
    if (job.type === "remote") {
      explanations.location = "Remote position - location irrelevant.";
    } else {
      explanations.location = `Candidate in ${(parsedData as any).location || "unknown location"}.`;
    }

    return explanations;
  }
}
