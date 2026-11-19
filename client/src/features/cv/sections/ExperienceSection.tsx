import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Briefcase } from 'lucide-react';
import { validateExperience } from '../cvValidation';
import type { ParsedCV } from '../CVBuilder';

interface ExperienceSectionProps {
  cv: ParsedCV;
  setCV: (cv: ParsedCV) => void;
}

interface ExperienceForm {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

const initialForm: ExperienceForm = {
  title: '',
  company: '',
  location: '',
  employmentType: 'full-time',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
};

export function ExperienceSection({ cv, setCV }: ExperienceSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ExperienceForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddClick = () => {
    setEditingIndex(null);
    setForm(initialForm);
    setErrors({});
    setShowForm(true);
  };

  const handleEditClick = (index: number) => {
    const exp = cv.experience[index];
    setForm({
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      employmentType: exp.employmentType || 'full-time',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      isCurrent: exp.isCurrent || false,
      description: (exp.description || []).join('\n'),
    });
    setEditingIndex(index);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    const validationErrors = validateExperience(form);
    
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    const newExperience = {
      ...form,
      description: form.description.split('\n').filter(line => line.trim()),
    };

    if (editingIndex !== null) {
      const updated = [...cv.experience];
      updated[editingIndex] = newExperience;
      setCV({ ...cv, experience: updated });
    } else {
      setCV({ ...cv, experience: [...cv.experience, newExperience] });
    }

    setShowForm(false);
    setForm(initialForm);
  };

  const handleRemove = (index: number) => {
    setCV({
      ...cv,
      experience: cv.experience.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Work Experience</h2>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Add Experience
          </button>
        )}
      </div>

      {/* Experience List */}
      <div className="space-y-3 mb-6">
        {cv.experience.map((exp, index) => (
          <div key={index} className="p-4 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white">{exp.title}</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">{exp.company}</p>
                <p className="text-xs text-surface-500 mt-1">
                  {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Present'} {exp.location && `• ${exp.location}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(index)}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-surface-600 rounded transition-colors"
                >
                  <Edit2 size={16} className="text-surface-600 dark:text-surface-400" />
                </button>
                <button
                  onClick={() => handleRemove(index)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                >
                  <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-4 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Position Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Software Engineer"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.title ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.title && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Company *
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Tech Corp"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.company ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.company && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.company}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Employment Type
              </label>
              <select
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Start Date (YYYY-MM) *
              </label>
              <input
                type="month"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white ${
                  errors.startDate ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.startDate && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  End Date (YYYY-MM)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isCurrent}
                    onChange={(e) => setForm({ ...form, isCurrent: e.target.checked, endDate: '' })}
                    className="w-4 h-4"
                  />
                  <span className="text-surface-600 dark:text-surface-400">Currently working here</span>
                </label>
              </div>
              <input
                type="month"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                disabled={form.isCurrent}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white disabled:opacity-50 ${
                  errors.endDate ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.endDate && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Description (Optional) - one per line
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Key responsibilities and achievements&#10;Each point on a new line"
              rows={4}
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-600">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
            >
              <Save size={16} />
              Save Experience
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-surface-300 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-900 dark:text-white font-medium rounded-lg flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
