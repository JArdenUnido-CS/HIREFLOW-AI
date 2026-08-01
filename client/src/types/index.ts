// ═══════════════════════════════════════════════════════════
// HireFlow AI — Core Type Definitions
// ═══════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'viewer' | 'candidate';
  department?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salaryMin: number;
  salaryMax: number;
  description: string;
  responsibilities: string[];
  benefits: string[];
  skillsRequired: string[];
  skillsPreferred: string[];
  experienceYears: number;
  education: string;
  hiringManager: string;
  status: 'open' | 'closed' | 'paused' | 'draft';
  deadline: string;
  applicantCount: number;
  createdAt: string;
  createdBy: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  photo?: string;
  resumeUrl?: string;
  status: PipelineStage;
  appliedDate: string;
  parsedData: ParsedResume;
  aiScores: AIScores;
  jobId?: string;
  matchScores?: MatchScores;
}

export interface ParsedResume {
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: SkillCategory[];
  certifications: string[];
  languages: string[];
  projects: Project[];
  totalYearsExperience: number;
  achievements: string[];
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | 'Present';
  description: string[];
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  year: number;
  gpa?: number;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface AIScores {
  overall: number;
  technical: number;
  experience: number;
  leadership: number;
  communication: number;
  problemSolving: number;
  teamwork: number;
  learningPotential: number;
  atsCompatibility: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidenceLevel: number;
}

export interface MatchScores {
  overall: number;
  technical: number;
  experience: number;
  education: number;
  skills: number;
  certification: number;
  location: number;
  salary: number;
  explanations: Record<string, string>;
  missingSkills: string[];
}

export type PipelineStage =
  | 'applied'
  | 'screening'
  | 'shortlisted'
  | 'interview'
  | 'technical_test'
  | 'hr_interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: string;
  type: 'technical' | 'behavioral' | 'hr' | 'coding' | 'final';
  status: 'scheduled' | 'completed' | 'cancelled';
  questions?: InterviewQuestion[];
  notes?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'leadership' | 'communication' | 'problem_solving' | 'coding' | 'hr' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  idealAnswer?: string;
  followUp?: string;
}

export interface Activity {
  id: string;
  type: 'candidate_added' | 'stage_changed' | 'interview_scheduled' | 'offer_sent' | 'note_added' | 'job_created';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  metadata?: Record<string, string>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalCandidates: number;
  candidatesThisWeek: number;
  interviewsScheduled: number;
  rejected: number;
  accepted: number;
  pendingReview: number;
  averageResumeScore: number;
  averageMatchScore: number;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}
