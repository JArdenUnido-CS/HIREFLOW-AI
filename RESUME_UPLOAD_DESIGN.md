# HIREFLOW-AI - Resume Upload Feature Design Document

**Version**: 1.0 | **Status**: Design Phase (No Implementation) | **Created**: October 7, 2026 | **Priority**: High | **Estimated Effort**: 2-3 weeks

---

## Executive Summary

Resume Upload feature enables recruiters to upload candidate resumes (PDF/DOC/DOCX), automatically parse data, and create/update candidate profiles. System maintains resume history and supports bulk uploads.

**Key Objectives**: Simplify profile creation, reduce manual data entry, maintain audit trail, support bulk operations

---

## User Stories

1. **Single Upload**: Drag-drop resume → auto-extract data → review → create candidate
2. **Bulk Upload**: Upload 5-100 files at once with progress tracking
3. **Auto-Parsing**: Extract name, email, phone, experience, education, skills, certs
4. **Versioning**: Track all resume versions with timestamps and uploader names
5. **Download/Preview**: View resumes in browser or download original
6. **Privacy**: Request deletion, auto-archive after 1 year

---

## Feature Requirements

### Functional Requirements (High Priority)
- FR-1: Support PDF, DOC, DOCX (validate by magic bytes, not extension)
- FR-2: Max 50MB file size with upload progress indicator
- FR-3: Extract text and parse into structured data
- FR-4: Create/update candidate profile from parsed data
- FR-5: Maintain all resume versions (no overwrites)
- FR-6: Full-text search on resume content
- FR-7: Preview in browser + download original format
- FR-8: Audit trail for upload/delete/access

### Non-Functional Requirements
- **Performance**: Upload <10s, Parse <5s, Preview <2s, Search <500ms
- **Security**: Virus scan (ClamAV), malware detection, access control, HTTPS only
- **Scalability**: 1000+ resumes/year, async processing, S3 storage
- **Reliability**: 99.9% uptime, daily backups, graceful error handling

---

## System Architecture

### Processing Pipeline
```
Upload → Validation → Virus Scan → Text Extraction → 
Parse Resume → Normalize Data → Match Candidate → 
Store File → Index for Search → Notify User
```

### Storage Options

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **AWS S3** (Recommended) | Scalable, secure, CDN, versioning | Requires AWS setup | ~$0.025/file + storage |
| **Digital Ocean Spaces** | Simple, S3-compatible, cheap | Less flexible | $5/mo + storage |
| **Local Filesystem** | Zero cost, fast, simple | Not scalable, security risks | Free (dev only) |

**Recommendation**: S3 for production, local for development

---

## Database Schema

### New Tables

```sql
-- Resume versions
CREATE TABLE resume_versions (
  id VARCHAR(36) PRIMARY KEY,
  candidate_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,  -- S3 key or local path
  file_size_bytes INT,
  file_mime_type VARCHAR(100),
  is_current BOOLEAN DEFAULT FALSE,
  uploaded_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  INDEX idx_candidate_id (candidate_id),
  INDEX idx_is_current (is_current)
);

-- Parsed resume data
CREATE TABLE resume_parsed_data (
  id VARCHAR(36) PRIMARY KEY,
  resume_version_id VARCHAR(36),
  candidate_id VARCHAR(36),
  extracted_name VARCHAR(255),
  extracted_email VARCHAR(255),
  extracted_phone VARCHAR(20),
  experience_json JSON,  -- Array of {company, title, duration}
  education_json JSON,   -- Array of {degree, field, institution, year}
  skills_json JSON,      -- Array of {category, skills}
  total_years_experience DECIMAL(5,1),
  extraction_quality_score DECIMAL(3,2),  -- 0.00-1.00
  has_conflicts BOOLEAN DEFAULT FALSE,
  parsed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_version_id) REFERENCES resume_versions(id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  INDEX idx_candidate_id (candidate_id)
);

-- Full-text search index
CREATE TABLE resume_search_index (
  id VARCHAR(36) PRIMARY KEY,
  resume_version_id VARCHAR(36),
  candidate_id VARCHAR(36),
  search_text LONGTEXT,
  indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_version_id) REFERENCES resume_versions(id),
  FULLTEXT INDEX ft_search_text (search_text),
  INDEX idx_candidate_id (candidate_id)
);

-- Audit trail
CREATE TABLE resume_upload_audit (
  id VARCHAR(36) PRIMARY KEY,
  candidate_id VARCHAR(36),
  uploaded_by VARCHAR(36),
  action VARCHAR(50),  -- 'uploaded', 'deleted', 'replaced'
  status VARCHAR(50),  -- 'success', 'failed', 'pending'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_candidate_id (candidate_id),
  INDEX idx_created_at (created_at)
);
```

---

## API Endpoints

### 1. Upload Resume
```
POST /api/candidates/:id/resume
Content-Type: multipart/form-data

Request: { file: File, create_if_not_exists?: boolean, override_data?: boolean }
Response: { success: true, resume_version: {...}, status: "parsing" }
```

### 2. Parse Resume
```
POST /api/resumes/:id/parse
Response: { parsed_data: {...}, quality_score: 0.92, conflicts: [...] }
```

### 3. Get Parsed Data
```
GET /api/candidates/:id/resume/parsed
Response: { parsed_data: {...}, extracted_at: "2024-10-07T10:31:00Z" }
```

### 4. List Versions
```
GET /api/candidates/:id/resumes
Response: { resumes: [{id, file_name, is_current, created_at, ...}] }
```

### 5. Preview Resume
```
GET /api/resumes/:id/preview?page=1
Response: PDF stream (application/pdf)
```

### 6. Download Resume
```
GET /api/resumes/:id/download
Response: File stream with Content-Disposition: attachment
```

### 7. Delete Resume
```
DELETE /api/resumes/:id
Response: { success: true, deleted_at: "..." }
```

### 8. Bulk Upload
```
POST /api/resumes/bulk-upload
Request: { files: File[], job_id?: string }
Response: { batch_id: "batch_xyz", total_files: 5, status: "processing" }

GET /api/batch-uploads/:batch_id/status
Response: { completed: 3, failed: 1, pending: 1, results: [...] }
```

### 9. Search Resumes
```
GET /api/candidates/search?q=react+typescript
Response: { results: [{candidate_id, name, matched_content, score: 0.95}] }
```

---

## Security Considerations

### File Upload Security
- Validate by magic bytes (not extension)
- Size limit: 50MB
- Sanitize filenames
- Reject suspicious files

### Virus Scanning
- Integrate ClamAV (open-source) or VirusTotal API
- Scan before storage
- Quarantine suspicious files
- Log all scans

### Access Control
- Only owner, managers, admins can access
- Enforce role-based permissions
- API endpoints validate permissions

### Data Privacy (GDPR)
- Right to deletion: Users request deletion
- Data minimization: Extract only necessary fields
- Retention: Auto-delete old versions after 1 year
- Audit: Log all access and downloads

### Encryption
- At Rest: S3 server-side encryption (AES-256)
- In Transit: HTTPS only (enforce production)
- TLS 1.2+

---

## UI/UX Components

### 1. Upload Modal
```
- Drag-drop zone (highlight on hover)
- File picker button
- Format/size requirements shown
- Create new candidate checkbox
- Override existing data checkbox
```

### 2. Upload Progress
```
- Progress bar with percentage
- File size / total shown
- Time estimate
- Cancel button
- Auto-retry on failure (3 attempts)
```

### 3. Parsed Data Review
```
- Display extracted fields (name, email, phone, etc)
- Show conflicts (yellow warning icons)
- Skills as removable tags
- Edit button to modify before saving
- Suggested job matches
- Create Candidate button
```

### 4. Resume Versions
```
- List all versions (newest first)
- Current version marked with star
- Upload date, size, uploader name
- Preview/Download/Delete buttons
- Auto-archived resumes shown separately
```

### 5. Resume Preview
```
- PDF/document viewer in modal
- Page navigation (prev/next)
- Download button
- Close button
- Full-screen option
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- Database schema setup
- API endpoints (upload, list, download, delete)
- File validation and storage (S3/local)
- Unit tests for file operations

**Deliverable**: Basic file upload/download working

### Phase 2: Resume Parsing (Week 2)
- Text extraction (PDF, DOC, DOCX libraries)
- Resume parsing engine
- Data extraction and normalization
- Quality scoring algorithm
- Integration tests

**Deliverable**: Parsed resume data available

### Phase 3: UI & Integration (Week 3)
- Upload modal component
- Parsed data review interface
- Resume versions management
- Candidate profile integration
- E2E tests
- Bug fixes and optimization

**Deliverable**: Complete user-facing feature

### Quality Assurance
- Security scanning (OWASP)
- Performance testing (load testing)
- Accessibility audit
- User testing with recruiters

---

## Error Handling & Edge Cases

| Error | Handling |
|-------|----------|
| File too large (>50MB) | Show "File exceeds 50MB limit" |
| Invalid format | Show "Only PDF, DOC, DOCX supported" |
| Corrupted file | Show "File appears corrupted" |
| Parsing failed | Show "Could not extract data. Manual review needed" |
| Duplicate email | Show conflict and merge options |
| Network timeout | Auto-retry or allow resume upload |
| Malware detected | Show "File contains malware" |
| Empty resume | Allow with warning |
| Non-English resume | Attempt extraction, note language |

---

## Performance Optimization

### Strategies
- **Async Processing**: Upload → background job for parsing (Bull queue)
- **Caching**: Cache parsed data for 24 hours (Redis)
- **Indexing**: Full-text index on resume content, composite indexes
- **Compression**: Store PDFs compressed, gzip API responses

### Metrics
| Metric | Target |
|--------|--------|
| Upload (50MB) | <10 seconds |
| Parse | <5 seconds |
| Search response | <500ms |
| Concurrent uploads | 100+ |
| Storage/resume | ~500KB average |

---

## Success Metrics

- **Adoption**: >80% of candidates have resumes within 3 months
- **Data Quality**: >90% of parsed fields are accurate
- **Time Saved**: ~5 minutes per candidate vs manual entry
- **User Satisfaction**: >4.5/5 rating from recruiters
- **Performance**: 95th percentile response <2 seconds
- **Uptime**: 99.9% availability

---

## Dependencies to Add

**Backend**:
```json
{
  "pdfparse": "^1.1.1",
  "docx": "^8.0.0",
  "bull": "^4.10.0",
  "ioredis": "^5.3.0",
  "sharp": "^0.32.0"
}
```

**Frontend**:
```json
{
  "react-dropzone": "^14.0.0",
  "react-pdf": "^7.0.0"
}
```

---

## Environment Configuration

```env
RESUME_MAX_SIZE_MB=50
RESUME_ALLOWED_TYPES=pdf,doc,docx
RESUME_STORAGE_TYPE=s3
RESUME_RETENTION_DAYS=365

AWS_S3_BUCKET=hireflow-resumes
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***

ENABLE_VIRUS_SCAN=true
CLAMAV_HOST=localhost
CLAMAV_PORT=3310

RESUME_PARSE_TIMEOUT_MS=30000
BULK_UPLOAD_MAX_FILES=100
```

---

## Future Enhancements

1. Resume comparison (side-by-side)
2. AI resume ranking (ML-based scoring)
3. Auto-screening based on criteria
4. Resume to job matching
5. Video resume support
6. Skill verification integration
7. Resume analytics and accuracy tracking
8. Resume templates generation

---

**Document Version**: 1.0 | **Status**: Design Complete - Ready for Implementation | **Next**: Create GitHub issue and assign to team
