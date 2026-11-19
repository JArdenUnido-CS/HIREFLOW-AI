import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Code } from 'lucide-react';
import { validateSkill } from '../cvValidation';
import type { ParsedCV } from '../CVBuilder';

interface SkillsSectionProps {
  cv: ParsedCV;
  setCV: (cv: ParsedCV) => void;
}

interface SkillForm {
  category: string;
  skills: string;
}

const initialForm: SkillForm = {
  category: '',
  skills: '',
};

export function SkillsSection({ cv, setCV }: SkillsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<SkillForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddClick = () => {
    setEditingIndex(null);
    setForm(initialForm);
    setErrors({});
    setShowForm(true);
  };

  const handleEditClick = (index: number) => {
    const skillGroup = cv.skills[index];
    setForm({
      category: skillGroup.category || '',
      skills: (skillGroup.skills || []).join(', '),
    });
    setEditingIndex(index);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    const skillsArray = form.skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const validationErrors = validateSkill({
      category: form.category,
      skills: skillsArray,
    });

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    const newSkillGroup = {
      category: form.category,
      skills: skillsArray,
    };

    if (editingIndex !== null) {
      const updated = [...cv.skills];
      updated[editingIndex] = newSkillGroup;
      setCV({ ...cv, skills: updated });
    } else {
      setCV({ ...cv, skills: [...cv.skills, newSkillGroup] });
    }

    setShowForm(false);
    setForm(initialForm);
  };

  const handleRemove = (index: number) => {
    setCV({
      ...cv,
      skills: cv.skills.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Skills</h2>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Add Skill Category
          </button>
        )}
      </div>

      {/* Skills List */}
      <div className="space-y-3 mb-6">
        {cv.skills.map((skillGroup, index) => (
          <div key={index} className="p-4 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white">{skillGroup.category}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillGroup.skills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
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
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Skill Category *
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g., Programming Languages, Frontend, DevOps"
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                errors.category ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
              }`}
            />
            {errors.category && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Skills (comma-separated) *
            </label>
            <textarea
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="JavaScript, TypeScript, React, Node.js"
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                errors.skills ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
              }`}
            />
            {errors.skills && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.skills}</p>}
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">
              Enter skills separated by commas (e.g., JavaScript, TypeScript, React)
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-600">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
            >
              <Save size={16} />
              Save Skills
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
