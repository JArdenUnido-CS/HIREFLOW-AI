import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, BookOpen } from 'lucide-react';
import { validateEducation } from '../cvValidation';
import type { ParsedCV } from '../CVBuilder';

interface EducationSectionProps {
  cv: ParsedCV;
  setCV: (cv: ParsedCV) => void;
}

interface EducationForm {
  degree: string;
  field: string;
  institution: string;
  year: number;
  startYear: number;
  gpa: number;
  description: string;
}

const initialForm: EducationForm = {
  degree: '',
  field: '',
  institution: '',
  year: new Date().getFullYear(),
  startYear: new Date().getFullYear() - 4,
  gpa: 0,
  description: '',
};

export function EducationSection({ cv, setCV }: EducationSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<EducationForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddClick = () => {
    setEditingIndex(null);
    setForm(initialForm);
    setErrors({});
    setShowForm(true);
  };

  const handleEditClick = (index: number) => {
    const edu = cv.education[index];
    setForm({
      degree: edu.degree || '',
      field: edu.field || '',
      institution: edu.institution || '',
      year: edu.year || new Date().getFullYear(),
      startYear: edu.startYear || new Date().getFullYear() - 4,
      gpa: edu.gpa || 0,
      description: edu.description || '',
    });
    setEditingIndex(index);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    const validationErrors = validateEducation(form);
    
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    const newEducation = { ...form };
    if (!form.gpa || form.gpa === 0) delete (newEducation as any).gpa;

    if (editingIndex !== null) {
      const updated = [...cv.education];
      updated[editingIndex] = newEducation;
      setCV({ ...cv, education: updated });
    } else {
      setCV({ ...cv, education: [...cv.education, newEducation] });
    }

    setShowForm(false);
    setForm(initialForm);
  };

  const handleRemove = (index: number) => {
    setCV({
      ...cv,
      education: cv.education.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Education</h2>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Add Education
          </button>
        )}
      </div>

      {/* Education List */}
      <div className="space-y-3 mb-6">
        {cv.education.map((edu, index) => (
          <div key={index} className="p-4 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white">{edu.degree} in {edu.field}</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">{edu.institution}</p>
                <p className="text-xs text-surface-500 mt-1">
                  {String(edu.startYear || Number(edu.year) - 4)} - {edu.year} {edu.gpa ? `• GPA: ${(edu.gpa as number).toFixed(1)}` : ''}
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
                Degree / Program *
              </label>
              <input
                type="text"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                placeholder="Bachelor's, Master's, etc."
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.degree ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.degree && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.degree}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Field of Study *
              </label>
              <input
                type="text"
                value={form.field}
                onChange={(e) => setForm({ ...form, field: e.target.value })}
                placeholder="Computer Science, Economics, etc."
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.field ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.field && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.field}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                School / Institution *
              </label>
              <input
                type="text"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                placeholder="University Name"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.institution ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.institution && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.institution}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Start Year (Optional)
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={form.startYear}
                onChange={(e) => setForm({ ...form, startYear: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Graduation Year *
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white ${
                  errors.year ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.year && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.year}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                GPA (Optional, 0-4)
              </label>
              <input
                type="number"
                min="0"
                max="4"
                step="0.1"
                value={form.gpa}
                onChange={(e) => setForm({ ...form, gpa: parseFloat(e.target.value) })}
                placeholder="3.8"
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Additional notes about your education"
              rows={3}
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-600">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
            >
              <Save size={16} />
              Save Education
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
