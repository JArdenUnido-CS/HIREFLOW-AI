/**
 * Scoring Utilities for Weighted Candidate Scoring Model
 * Helper functions for keyword matching, data extraction, and calculation
 */

export interface KeywordMatch {
  keyword: string;
  count: number;
  matchedTexts: string[];
}

/**
 * Extract all text content from experience descriptions
 */
export function extractExperienceText(
  experience: Array<{ description?: string[] }>
): string {
  return experience
    .flatMap((exp) => exp.description || [])
    .join(" ")
    .toLowerCase();
}

/**
 * Count keyword matches in text (case-insensitive, whole-word or phrase matches)
 */
export function countKeywordMatches(
  text: string,
  keywords: string[]
): KeywordMatch[] {
  const lowerText = text.toLowerCase();
  const results: KeywordMatch[] = [];

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "gi");
    const matches = lowerText.match(regex) || [];
    
    if (matches.length > 0) {
      results.push({
        keyword,
        count: matches.length,
        matchedTexts: matches,
      });
    }
  }

  return results;
}

/**
 * Extract numeric values from text (e.g., "50M", "5k", "100")
 * Returns the largest numeric value found
 */
export function extractLargestNumericValue(text: string): number {
  const lowerText = text.toLowerCase();
  
  // Patterns: 50M, 50m, 50 million, 5k, 5 thousand, etc.
  const millionPattern = /(\d+(?:\.\d+)?)\s*(?:m|million)/gi;
  const thousandPattern = /(\d+(?:\.\d+)?)\s*(?:k|thousand)/gi;
  const plainPattern = /(\d+)(?![\d\w])/g; // Plain numbers not part of larger numbers
  
  let maxValue = 0;
  
  // Check millions
  let match;
  while ((match = millionPattern.exec(lowerText)) !== null) {
    const value = parseFloat(match[1]) * 1000000;
    maxValue = Math.max(maxValue, value);
  }
  
  // Check thousands
  while ((match = thousandPattern.exec(lowerText)) !== null) {
    const value = parseFloat(match[1]) * 1000;
    maxValue = Math.max(maxValue, value);
  }
  
  // Check plain numbers (if no millions/thousands found)
  if (maxValue === 0) {
    while ((match = plainPattern.exec(lowerText)) !== null) {
      const value = parseInt(match[1]);
      maxValue = Math.max(maxValue, value);
    }
  }
  
  return maxValue;
}

/**
 * Calculate years between start and end dates (YYYY-MM format)
 */
export function calculateYearsBetween(startDate: string, endDate: string | "Present"): number {
  const [startYear, startMonth] = startDate.split("-").map(Number);
  
  if (endDate === "Present") {
    const now = new Date();
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth() + 1;
    
    const months = (nowYear - startYear) * 12 + (nowMonth - startMonth);
    return months / 12;
  }
  
  const [endYear, endMonth] = endDate.split("-").map(Number);
  const months = (endYear - startYear) * 12 + (endMonth - startMonth);
  return months / 12;
}

/**
 * Extract seniority level from job title
 */
export function extractSeniorityLevel(title: string): number {
  const lowerTitle = title.toLowerCase();
  
  const leadKeywords = ["tech lead", "engineering manager", "staff engineer", "principal", "director", "head", "vp", "cto"];
  const seniorKeywords = ["senior", "lead engineer"];
  const midKeywords = ["engineer", "developer", "specialist", "analyst"];
  const juniorKeywords = ["junior", "associate", "intern", "graduate", "entry"];
  
  if (leadKeywords.some((kw) => lowerTitle.includes(kw))) return 4;
  if (seniorKeywords.some((kw) => lowerTitle.includes(kw))) return 3;
  if (midKeywords.some((kw) => lowerTitle.includes(kw))) return 2;
  if (juniorKeywords.some((kw) => lowerTitle.includes(kw))) return 1;
  
  return 1; // Default to junior if unclear
}

/**
 * Extract domain category from job title and skills
 */
export function extractPrimaryDomain(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes("frontend") || lowerTitle.includes("react") || lowerTitle.includes("vue") || lowerTitle.includes("angular")) return "Frontend";
  if (lowerTitle.includes("backend") || lowerTitle.includes("node") || lowerTitle.includes("python") || lowerTitle.includes("java")) return "Backend";
  if (lowerTitle.includes("full") || lowerTitle.includes("fullstack")) return "Full-stack";
  if (lowerTitle.includes("ml") || lowerTitle.includes("machine learning") || lowerTitle.includes("pytorch") || lowerTitle.includes("tensorflow")) return "ML";
  if (lowerTitle.includes("design") || lowerTitle.includes("ux") || lowerTitle.includes("ui")) return "Design";
  if (lowerTitle.includes("devops") || lowerTitle.includes("infrastructure") || lowerTitle.includes("docker") || lowerTitle.includes("kubernetes")) return "DevOps";
  
  return "Other";
}

/**
 * Compare two domains for adjacency
 */
export function areDomainsAdjacent(domain1: string, domain2: string): boolean {
  const adjacencyMap: Record<string, string[]> = {
    "Frontend": ["Full-stack"],
    "Backend": ["Full-stack"],
    "Full-stack": ["Frontend", "Backend"],
    "ML": ["Backend", "Data"],
    "DevOps": ["Backend", "Infrastructure"],
    "Design": ["Frontend", "UX"],
  };
  
  const adjacent = adjacencyMap[domain1] || [];
  return adjacent.includes(domain2);
}

/**
 * Parse education requirement string to extract degree level
 */
export function parseEducationRequirement(educationStr: string | null): number {
  if (!educationStr) return 0;
  
  const lower = educationStr.toLowerCase();
  
  if (lower.includes("ph.d") || lower.includes("phd") || lower.includes("doctor")) return 5;
  if (lower.includes("master") || lower.includes("m.s") || lower.includes("m.a") || lower.includes("mba")) return 4;
  if (lower.includes("bachelor") || lower.includes("b.s") || lower.includes("b.a") || lower.includes("b.e")) return 3;
  if (lower.includes("associate") || lower.includes("a.a") || lower.includes("a.s")) return 2;
  if (lower.includes("high school") || lower.includes("diploma")) return 1;
  
  return 0;
}

/**
 * Parse candidate degree to extract level
 */
export function parseCandidateDegree(degreeStr: string): number {
  const lower = degreeStr.toLowerCase();
  
  if (lower.includes("ph.d") || lower.includes("phd") || lower === "doctor") return 5;
  if (lower === "m.s" || lower === "m.a" || lower === "mba" || lower.startsWith("m.")) return 4;
  if (lower === "b.s" || lower === "b.a" || lower === "b.e" || lower.startsWith("b.")) return 3;
  if (lower.startsWith("a.") || lower.includes("associate")) return 2;
  if (lower.includes("diploma") || lower.includes("high school")) return 1;
  
  return 0;
}

/**
 * Calculate institution prestige score based on name
 */
export function calculateInstitutionPrestige(institution: string): number {
  const tier1 = [
    "mit", "stanford", "cmu", "berkeley", "cambridge", "oxford", "caltech",
    "harvard", "yale", "princeton", "imperial college", "eth"
  ];
  const tier2 = [
    "duke", "carnegie", "penn", "cornell", "northwestern", "michigan",
    "cambridge", "london school of economics", "ucl", "toronto"
  ];
  
  const lower = institution.toLowerCase();
  
  if (tier1.some((t) => lower.includes(t))) return 100;
  if (tier2.some((t) => lower.includes(t))) return 75;
  if (lower.includes("university") || lower.includes("college")) return 50;
  
  return 30;
}

/**
 * Parse location to extract city and state/country
 */
export function parseLocation(location: string): { city: string; state: string; country: string } {
  const parts = location.split(",").map((p) => p.trim());
  
  return {
    city: parts[0] || "",
    state: parts[1] || "",
    country: parts[2] || "USA",
  };
}

/**
 * Calculate location match score between candidate and job
 */
export function calculateLocationMatch(
  candidateLocation: string,
  jobLocation: string,
  jobType: string
): number {
  // Remote jobs don't care about location
  if (jobType === "remote") return 100;
  
  const candLoc = parseLocation(candidateLocation);
  const jobLoc = parseLocation(jobLocation);
  
  // Exact city match
  if (candLoc.city.toLowerCase() === jobLoc.city.toLowerCase() &&
      candLoc.state.toLowerCase() === jobLoc.state.toLowerCase()) {
    return 100;
  }
  
  // Same state
  if (candLoc.state.toLowerCase() === jobLoc.state.toLowerCase()) {
    return 80;
  }
  
  // Same country
  if (candLoc.country.toLowerCase() === jobLoc.country.toLowerCase()) {
    return 60;
  }
  
  // Different country
  return 30;
}

/**
 * Flatten skill categories into single array
 */
export function flattenSkills(skills: Array<{ category: string; skills: string[] }>): string[] {
  return skills.flatMap((s) => s.skills);
}

/**
 * Find matching skills between candidate and required skills (case-insensitive)
 */
export function findMatchingSkills(candidateSkills: string[], requiredSkills: string[]): string[] {
  const candidateLower = candidateSkills.map((s) => s.toLowerCase());
  const requiredLower = requiredSkills.map((s) => s.toLowerCase());
  
  return requiredLower.filter((req) => candidateLower.includes(req));
}

/**
 * Cap a score at 100
 */
export function capScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}

/**
 * Round score to 1 decimal place
 */
export function roundScore(score: number): number {
  return Math.round(score * 10) / 10;
}

/**
 * Calculate weighted average
 */
export function calculateWeightedAverage(
  scores: Array<{ value: number; weight: number }>
): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;
  
  const totalScore = scores.reduce((sum, s) => sum + s.value * s.weight, 0);
  return totalScore / totalWeight;
}
