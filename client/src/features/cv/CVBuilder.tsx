import { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { ProfessionalSummarySection } from './sections/ProfessionalSummarySection';
import { EducationSection } from './sections/EducationSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { SkillsSection } from './sections/SkillsSection';
import { LanguagesSection } from './sections/LanguagesSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { CVPreview } from './CVPreview';

export interface ParsedCV {
  summary: string;
  experience: any[];
  education: any[];
  skills: any[];
  certifications: any[];
  languages: any[];
  projects: any[];
  achievements: string[];
}

interface CVBuilderProps {
  candidateId?: string;
  onSave?: () => void;
}

export function CVBuilder({ candidateId: initialCandidateId, onSave }: CVBuilderProps) {
  const { user } = useAuthStore();
  const [cv, setCV] = useState<ParsedCV>({
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    projects: [],
    achievements: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [candidateId, setCandidateId] = useState<string | null>(initialCandidateId || null);

  // Use the user's email as a stable identifier, but fetch/create candidate first
  const userEmail = user?.email;

  useEffect(() => {
    if (userEmail) {
      loadCV();
    }
  }, [userEmail]);

  const loadCV = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      // First, get or create candidate by email
      const candidateRes = await fetch(`http://localhost:3001/api/cv/by-email/${userEmail}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!candidateRes.ok) {
        toast.error('Failed to load candidate profile');
        return;
      }

      const candidateData = await candidateRes.json();
      setCandidateId(candidateData.id);

      // Now fetch the CV using the candidate ID
      const res = await fetch(`http://localhost:3001/api/cv/${candidateData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const parsedData = data.parsed_data || cv;
        
        setCV({
          summary: parsedData.summary || '',
          experience: parsedData.experience || [],
          education: parsedData.education || [],
          skills: parsedData.skills || [],
          certifications: parsedData.certifications || [],
          languages: parsedData.languages || [],
          projects: parsedData.projects || [],
          achievements: parsedData.achievements || [],
        });
      }
    } catch (error) {
      console.error('Failed to load CV:', error);
      // Continue with empty CV if load fails
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCV = async () => {
    try {
      setSaving(true);
      setErrors({});

      const token = localStorage.getItem('auth_token');
      if (!token || !candidateId) {
        toast.error('Not authenticated');
        return;
      }

      const res = await fetch(`http://localhost:3001/api/cv/${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cv),
      });

      if (res.ok) {
        toast.success('CV saved successfully!');
        onSave?.();
      } else {
        const errorData = await res.json();
        if (errorData.details) {
          const newErrors: Record<string, string> = {};
          errorData.details.forEach((err: any) => {
            newErrors[err.path] = err.message;
          });
          setErrors(newErrors);
          toast.error('Please fix validation errors');
        } else {
          toast.error(errorData.error || 'Failed to save CV');
        }
      }
    } catch (error) {
      console.error('Failed to save CV:', error);
      toast.error('Failed to save CV');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-surface-600 dark:text-surface-400">Loading CV...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">CV Builder</h1>
          <p className="text-surface-600 dark:text-surface-400 mt-2">Create and manage your professional CV</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-900 dark:text-white transition-colors"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSaveCV}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save CV'}
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 dark:text-red-100 mb-2">Please fix these errors:</h3>
              <ul className="space-y-1">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="text-sm text-red-800 dark:text-red-300">
                    • {field}: {message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {showPreview ? (
        <CVPreview cv={cv} />
      ) : (
        <div className="space-y-6">
          <PersonalInfoSection cv={cv} setCV={setCV} />
          <ProfessionalSummarySection cv={cv} setCV={setCV} />
          <ExperienceSection cv={cv} setCV={setCV} />
          <EducationSection cv={cv} setCV={setCV} />
          <SkillsSection cv={cv} setCV={setCV} />
          <LanguagesSection cv={cv} setCV={setCV} />
          <CertificationsSection cv={cv} setCV={setCV} />
          <ProjectsSection cv={cv} setCV={setCV} />
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex gap-3 pt-6 border-t border-surface-200 dark:border-surface-700">
        <button
          onClick={handleSaveCV}
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save CV'}
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 rounded-lg border border-surface-300 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-900 dark:text-white font-medium flex items-center gap-2"
        >
          <X size={18} />
          Cancel
        </button>
      </div>
    </div>
  );
}
