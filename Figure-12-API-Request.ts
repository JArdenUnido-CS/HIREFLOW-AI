// FIGURE 12: API REQUEST EXAMPLE
// POST Request to Create Candidate with Resume Screening

/* ═══════════════════════════════════════════════════════════════════
   REQUEST OVERVIEW
   ═══════════════════════════════════════════════════════════════════ */

// HTTP Request
// Method: POST
// Endpoint: /api/candidates
// Host: localhost:3001
// Port: 3001
// Auth: Bearer JWT Token
// Response: 201 Created


/* ═══════════════════════════════════════════════════════════════════
   RAW HTTP REQUEST
   ═══════════════════════════════════════════════════════════════════ */

POST /api/candidates HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Request-ID: req-2026-10-08-001
User-Agent: Mozilla/5.0 (React/Axios)
Accept: application/json
Accept-Encoding: gzip, deflate
Content-Length: 512

{
  "name": "Jane Smith",
  "email": "jane.smith@email.com",
  "phone": "+1-555-0123",
  "location": "San Francisco, CA",
  "linkedin": "https://linkedin.com/in/janesmith",
  "github": "https://github.com/janesmith",
  "portfolio": "https://janesmith.dev",
  "resume_url": "https://drive.google.com/file/d/resume.pdf",
  "resume_text": "Senior Software Engineer with 5+ years experience in full-stack development, specialized in React, Node.js, and cloud architecture...",
  "job_id": "job-frontend-2026-10",
  "status": "applied"
}


/* ═══════════════════════════════════════════════════════════════════
   REQUEST HEADERS BREAKDOWN
   ═══════════════════════════════════════════════════════════════════ */

Host: localhost:3001
  └─ Server address where request is sent

Content-Type: application/json
  └─ Specifies request body format

Authorization: Bearer <JWT_TOKEN>
  └─ JWT token for authentication
  └─ Format: Bearer [token_string]
  └─ Token expires in: 7 days

X-Request-ID: req-2026-10-08-001
  └─ Unique request identifier for tracking

User-Agent: Mozilla/5.0 (React/Axios)
  └─ Client information (React app using Axios)

Accept: application/json
  └─ Expected response format

Content-Length: 512
  └─ Size of request body in bytes


/* ═══════════════════════════════════════════════════════════════════
   REQUEST BODY STRUCTURE
   ═══════════════════════════════════════════════════════════════════ */

{
  // Personal Information
  "name": "Jane Smith",                    // Required: Full name
  "email": "jane.smith@email.com",         // Required: Email address
  "phone": "+1-555-0123",                  // Optional: Phone number
  "location": "San Francisco, CA",         // Optional: Location
  
  // Social Profiles
  "linkedin": "https://linkedin.com/in/janesmith",   // Optional: LinkedIn URL
  "github": "https://github.com/janesmith",          // Optional: GitHub URL
  "portfolio": "https://janesmith.dev",              // Optional: Portfolio URL
  
  // Resume Data
  "resume_url": "https://drive.google.com/file/d/resume.pdf",  // Optional: Public resume link
  "resume_text": "Senior Software Engineer...",                 // Optional: Resume content
  
  // Application Context
  "job_id": "job-frontend-2026-10",     // Required: Target job ID
  "status": "applied"                    // Required: Application status
}


/* ═══════════════════════════════════════════════════════════════════
   CURL EXAMPLE
   ═══════════════════════════════════════════════════════════════════ */

curl -X POST http://localhost:3001/api/candidates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@email.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA",
    "linkedin": "https://linkedin.com/in/janesmith",
    "github": "https://github.com/janesmith",
    "portfolio": "https://janesmith.dev",
    "resume_url": "https://drive.google.com/file/d/resume.pdf",
    "resume_text": "Senior Software Engineer with 5+ years experience...",
    "job_id": "job-frontend-2026-10",
    "status": "applied"
  }'


/* ═══════════════════════════════════════════════════════════════════
   AXIOS REQUEST (React Frontend Implementation)
   ═══════════════════════════════════════════════════════════════════ */

import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface CandidateData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resume_url?: string;
  resume_text: string;
  job_id: string;
  status: 'applied' | 'screening' | 'interview' | 'technical_test' | 'offer' | 'hired';
}

const createCandidate = async (candidateData: CandidateData) => {
  try {
    const response = await api.post('/api/candidates', {
      name: candidateData.name,
      email: candidateData.email,
      phone: candidateData.phone,
      location: candidateData.location,
      linkedin: candidateData.linkedin,
      github: candidateData.github,
      portfolio: candidateData.portfolio,
      resume_url: candidateData.resume_url,
      resume_text: candidateData.resume_text,
      job_id: candidateData.job_id,
      status: candidateData.status
    });
    
    console.log('✓ Candidate created successfully:', response.data);
    toast.success('Candidate added to pipeline!');
    return response.data;
    
  } catch (error) {
    console.error('✗ Failed to create candidate:', error);
    
    if (error.response?.status === 400) {
      toast.error('Validation error: ' + error.response.data.details[0].message);
    } else if (error.response?.status === 409) {
      toast.error('Email already registered');
    } else {
      toast.error('Failed to create candidate');
    }
    
    throw error;
  }
};

// Usage
await createCandidate({
  name: "Jane Smith",
  email: "jane.smith@email.com",
  phone: "+1-555-0123",
  location: "San Francisco, CA",
  linkedin: "https://linkedin.com/in/janesmith",
  github: "https://github.com/janesmith",
  portfolio: "https://janesmith.dev",
  resume_url: "https://drive.google.com/file/d/resume.pdf",
  resume_text: "Senior Software Engineer with 5+ years experience...",
  job_id: "job-frontend-2026-10",
  status: "applied"
});


/* ═══════════════════════════════════════════════════════════════════
   REQUEST VALIDATION (Zod Schema)
   ═══════════════════════════════════════════════════════════════════ */

import { z } from 'zod';

const createCandidateSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
    
  email: z.string()
    .email('Invalid email format'),
    
  phone: z.string()
    .optional()
    .refine(v => !v || /^\+?[1-9]\d{1,14}$/.test(v), 'Invalid phone format'),
    
  location: z.string().optional(),
  
  linkedin: z.string()
    .url('Invalid LinkedIn URL')
    .optional(),
    
  github: z.string()
    .url('Invalid GitHub URL')
    .optional(),
    
  portfolio: z.string()
    .url('Invalid portfolio URL')
    .optional(),
    
  resume_url: z.string()
    .url('Invalid resume URL')
    .optional(),
    
  resume_text: z.string()
    .min(50, 'Resume must be at least 50 characters')
    .max(50000, 'Resume cannot exceed 50,000 characters'),
    
  job_id: z.string()
    .uuid('Invalid job ID format'),
    
  status: z.enum(['applied', 'screening', 'interview', 'technical_test', 'offer', 'hired'])
});

// Validate before sending
try {
  const validatedData = createCandidateSchema.parse(requestData);
  // Send to API
} catch (error) {
  // Handle validation errors
  console.error('Validation failed:', error.errors);
}


/* ═══════════════════════════════════════════════════════════════════
   REQUEST TIMING & PERFORMANCE
   ═══════════════════════════════════════════════════════════════════ */

Total Request Time: ~250ms

Breakdown:
├─ Network Latency (client to server): ~10ms
├─ Server Request Processing: ~50ms
├─ Input Validation (Zod schema): ~5ms
├─ Resume Parsing: ~15ms
├─ Feature Extraction: ~20ms
├─ Database Query: ~100ms
├─ ML Model Inference (Random Forest): ~80ms
├─ Response Serialization: ~10ms
└─ Network Latency (server to client): ~10ms
   ═══════════════════════════════════════════════════════════════════
   Total End-to-End: ~260ms


/* ═══════════════════════════════════════════════════════════════════
   KEY POINTS
   ═══════════════════════════════════════════════════════════════════

1. Authentication
   - JWT token required in Authorization header
   - Token obtained from login endpoint
   - Token expires in 7 days

2. Validation
   - All fields validated with Zod schema
   - Email must be valid and unique
   - Resume text minimum 50 characters
   - Job ID must exist in database

3. Processing
   - Resume parsed and processed
   - Skills extracted automatically
   - ML model inference performed
   - Candidate profile created

4. Error Handling
   - 400: Validation failed
   - 401: Unauthorized (invalid token)
   - 409: Email already exists
   - 500: Server error

5. Performance
   - Sub-300ms response time
   - Database connection pooling used
   - ML inference optimized
   - Asynchronous processing
*/
