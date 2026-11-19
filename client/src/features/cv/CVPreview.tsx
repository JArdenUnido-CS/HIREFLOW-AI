import { useAuthStore } from '@/stores/authStore';
import type { ParsedCV } from './CVBuilder';

interface CVPreviewProps {
  cv: ParsedCV;
}

export function CVPreview({ cv }: CVPreviewProps) {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-surface-800 rounded-lg shadow-lg p-12 print:shadow-none print:p-0">
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-surface-200 dark:border-surface-700">
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-2">{user?.name || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-surface-600 dark:text-surface-400">
          {user?.email && <span>{user.email}</span>}
          {cv.experience.length > 0 && (
            <span className="font-medium">
              {Math.round(
                cv.experience.reduce((acc, exp) => {
                  const start = new Date(exp.startDate + '-01');
                  const end = exp.isCurrent ? new Date() : new Date(exp.endDate + '-01');
                  return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                }, 0)
              )}+ years experience
            </span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {cv.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-3 uppercase tracking-wide">
            Professional Summary
          </h2>
          <p className="text-surface-700 dark:text-surface-300 leading-relaxed">{cv.summary}</p>
        </div>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 uppercase tracking-wide">
            Work Experience
          </h2>
          <div className="space-y-6">
            {cv.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white">{exp.title}</h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400">{exp.company}</p>
                  </div>
                  <span className="text-sm text-surface-500 dark:text-surface-400 whitespace-nowrap">
                    {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.location && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">{exp.location}</p>
                )}
                {exp.description && exp.description.length > 0 && (
                  <ul className="mt-2 space-y-1 ml-4">
                    {exp.description.map((desc: string, i: number) => (
                      <li key={i} className="text-sm text-surface-700 dark:text-surface-300 list-disc">
                        {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {cv.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 uppercase tracking-wide">
            Education
          </h2>
          <div className="space-y-4">
            {cv.education.map((edu, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white">{edu.degree}</h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400">{edu.institution}</p>
                  </div>
                  <span className="text-sm text-surface-500 dark:text-surface-400">
                    {edu.startYear ? `${edu.startYear} – ` : ''}{edu.year}
                  </span>
                </div>
                {edu.field && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Field: {edu.field}</p>
                )}
                {edu.gpa && (
                  <p className="text-sm text-surface-600 dark:text-surface-400">GPA: {edu.gpa}</p>
                )}
                {edu.description && (
                  <p className="text-sm text-surface-700 dark:text-surface-300 mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {cv.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 uppercase tracking-wide">
            Skills
          </h2>
          <div className="space-y-3">
            {cv.skills.map((skillGroup, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-surface-900 dark:text-white text-sm mb-2">{skillGroup.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.skills.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {cv.languages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 uppercase tracking-wide">
            Languages
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {cv.languages.map((lang, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-surface-900 dark:text-white font-medium">{lang.language}</span>
                <span className="text-surface-600 dark:text-surface-400">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {cv.certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 uppercase tracking-wide">
            Certifications & Licenses
          </h2>
          <div className="space-y-3">
            {cv.certifications.map((cert, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-surface-900 dark:text-white text-sm">{cert.name}</h3>
                <div className="flex justify-between text-xs text-surface-600 dark:text-surface-400 mt-1">
                  <span>{cert.issuer}</span>
                  <span>
                    {cert.dateIssued && `Issued: ${cert.dateIssued}`}
                    {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {cv.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4 uppercase tracking-wide">
            Projects
          </h2>
          <div className="space-y-5">
            {cv.projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white">{proj.name}</h3>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {proj.url}
                      </a>
                    )}
                  </div>
                  {(proj.startDate || proj.endDate) && (
                    <span className="text-xs text-surface-500 dark:text-surface-400 whitespace-nowrap">
                      {proj.startDate} – {proj.endDate}
                    </span>
                  )}
                </div>
                <p className="text-sm text-surface-700 dark:text-surface-300 mt-2">{proj.description}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {proj.technologies.map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .dark {
            color-scheme: light;
          }
        }
      `}</style>
    </div>
  );
}
