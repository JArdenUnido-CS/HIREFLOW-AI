import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Globe } from 'lucide-react';
import { validateLanguage } from '../cvValidation';
import type { ParsedCV } from '../CVBuilder';

interface LanguagesSectionProps {
  cv: ParsedCV;
  setCV: (cv: ParsedCV) => void;
}

interface LanguageForm {
  language: string;
  proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Fluent' | 'Native';
}

const initialForm: LanguageForm = {
  language: '',
  proficiency: 'Intermediate',
};

const proficiencyOptions = ['Basic', 'Intermediate', 'Advanced', 'Fluent', 'Native'] as const;

export function LanguagesSection({ cv, setCV }: LanguagesSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<LanguageForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddClick = () => {
    setEditingIndex(null);
    setForm(initialForm);
    setErrors({});
    setShowForm(true);
  };

  const handleEditClick = (index: number) => {
    const lang = cv.languages[index];
    setForm({
      language: lang.language || '',
      proficiency: lang.proficiency || 'Intermediate',
    });
    setEditingIndex(index);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    const validationErrors = validateLanguage(form);

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    if (editingIndex !== null) {
      const updated = [...cv.languages];
      updated[editingIndex] = form;
      setCV({ ...cv, languages: updated });
    } else {
      setCV({ ...cv, languages: [...cv.languages, form] });
    }

    setShowForm(false);
    setForm(initialForm);
  };

  const handleRemove = (index: number) => {
    setCV({
      ...cv,
      languages: cv.languages.filter((_, i) => i !== index),
    });
  };

  const getProficiencyColor = (proficiency: string) => {
    const colors: Record<string, string> = {
      'Basic': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'Intermediate': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
      'Advanced': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Fluent': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      'Native': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    };
    return colors[proficiency] || colors['Intermediate'];
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Languages</h2>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Add Language
          </button>
        )}
      </div>

      {/* Languages List */}
      <div className="space-y-3 mb-6">
        {cv.languages.map((lang, index) => (
          <div key={index} className="p-4 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-bold text-surface-900 dark:text-white">{lang.language}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProficiencyColor(lang.proficiency)}`}>
                  {lang.proficiency}
                </span>
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
                Language *
              </label>
              <input
                type="text"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="e.g., English, Spanish, Mandarin"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.language ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.language && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.language}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Proficiency Level *
              </label>
              <select
                value={form.proficiency}
                onChange={(e) => setForm({ ...form, proficiency: e.target.value as any })}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white ${
                  errors.proficiency ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              >
                {proficiencyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.proficiency && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.proficiency}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-600">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
            >
              <Save size={16} />
              Save Language
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
