import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { jobsApi } from '@/services/api';
import toast from 'react-hot-toast';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateJobModal({ isOpen, onClose, onSuccess }: CreateJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time' as const,
    salary_min: '',
    salary_max: '',
    description: '',
    skills_required: [] as string[],
    experience_years: '',
    education: '',
    status: 'open' as const,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(s => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.department || !formData.location || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await jobsApi.create({
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      });
      toast.success('Job created successfully');
      onClose();
      onSuccess();
      // Reset form
      setFormData({
        title: '',
        department: '',
        location: '',
        type: 'full-time',
        salary_min: '',
        salary_max: '',
        description: '',
        skills_required: [],
        experience_years: '',
        education: '',
        status: 'open',
      });
    } catch (error) {
      toast.error('Failed to create job');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Create New Job</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-200 dark:hover:bg-surface-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-surface-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Job Title *"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Frontend Engineer"
                    required
                  />
                  <Input
                    label="Department *"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Engineering"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Location *"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., San Francisco, CA"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Employment Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Salary Min"
                    name="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                    placeholder="e.g., 100000"
                  />
                  <Input
                    label="Salary Max"
                    name="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                    placeholder="e.g., 200000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Years of Experience"
                    name="experience_years"
                    type="number"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                  />
                  <Input
                    label="Education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="e.g., Bachelor's in CS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Job description..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                    required
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Required Skills
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="e.g., React"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_required.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-brand-900 dark:hover:text-brand-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" loading={loading} className="flex-1">
                    Create Job
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
