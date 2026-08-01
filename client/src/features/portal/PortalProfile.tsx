import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Award, GraduationCap, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { sampleCandidates } from '@/data/sampleData';
import { useAuthStore } from '@/stores/authStore';

export function PortalProfile() {
  const { user } = useAuthStore();
  const candidate = sampleCandidates[0];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Profile</h1>
            <p className="text-surface-500 mt-1">Manage your professional profile</p>
          </div>
          <Button variant="primary">Edit Profile</Button>
        </div>

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar name={user?.name || candidate.name} size="xl" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">{user?.name || candidate.name}</h2>
                <p className="text-surface-500 mt-1">{candidate.parsedData.summary.slice(0, 120)}...</p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-surface-500">
                  <span className="flex items-center gap-1.5"><Mail size={14} />{user?.email || candidate.email}</span>
                  <span className="flex items-center gap-1.5"><Phone size={14} />{candidate.phone}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} />{candidate.location}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {candidate.linkedin && (
                    <a href="#" className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700">
                      <Linkedin size={13} /> LinkedIn
                    </a>
                  )}
                  {candidate.github && (
                    <a href="#" className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700">
                      <Github size={13} /> GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <StaggerContainer className="space-y-6">
          {/* Experience */}
          <StaggerItem>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                <Briefcase size={18} className="text-brand-500" />
                Experience
              </h3>
              <div className="space-y-5">
                {candidate.parsedData.experience.map((exp, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                      <Briefcase size={16} className="text-surface-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-surface-800 dark:text-surface-200">{exp.title}</h4>
                      <p className="text-sm text-surface-500">{exp.company} · {exp.location}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{exp.startDate} — {exp.endDate}</p>
                      <ul className="mt-2 space-y-1">
                        {exp.description.map((d, j) => (
                          <li key={j} className="text-sm text-surface-600 dark:text-surface-400 flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-surface-400 mt-2 shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </StaggerItem>

          {/* Education */}
          <StaggerItem>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-violet-500" />
                Education
              </h3>
              <div className="space-y-4">
                {candidate.parsedData.education.map((edu, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
                      <GraduationCap size={16} className="text-violet-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                        {edu.degree} in {edu.field}
                      </h4>
                      <p className="text-sm text-surface-500">{edu.institution} · {edu.year}</p>
                      {edu.gpa && <p className="text-xs text-surface-400 mt-0.5">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </StaggerItem>

          {/* Skills */}
          <StaggerItem>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                <Award size={18} className="text-emerald-500" />
                Skills
              </h3>
              <div className="space-y-4">
                {candidate.parsedData.skills.map((category, i) => (
                  <div key={i}>
                    <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-2">{category.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill) => (
                        <Badge key={skill} variant="brand" size="md">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {candidate.parsedData.certifications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wide mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.parsedData.certifications.map((cert) => (
                      <Badge key={cert} variant="success" size="md">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
