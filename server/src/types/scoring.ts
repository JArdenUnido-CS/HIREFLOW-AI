/**
 * Type definitions for the Weighted Candidate Scoring Model
 */

export interface ParsedResume {
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string; // YYYY-MM
    endDate: string | "Present"; // YYYY-MM or "Present"
    description?: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    year: number;
    gpa?: number;
  }>;
  skills: Array<{
    category: string;
    skills: string[];
  }>;
  certifications: string[];
  languages: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  totalYearsExperience: number;
  achievements: string[];
  
  // Optional additional fields
  github?: string;
  linkedin?: string;
  portfolio?: string;
  location?: string; // Candidate's current or preferred location
}

