import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Award } from 'lucide-react';
import { validateCertification } from '../cvValidation';
import type { ParsedCV } from '../CVBuilder';

interface CertificationsSectionProps {
  cv: ParsedCV;
  setCV: (cv: ParsedCV) => void;
}

interface CertificationForm {
  name: string;
  issuer: string;
  dateIssued: string;
  expiryDate: string;
}

const initialForm: CertificationForm = {
  name: '',
  issuer: '',
  dateIssued: '',
  expiryDate: '',
};

export function CertificationsSection({ cv, setCV }: CertificationsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<CertificationForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddClick = () => {
    setEditingIndex(null);
    setForm(initialForm);
    setErrors({});
    setShowForm(true);
  };

  const handleEditClick = (index: number) => {
    const cert = cv.certifications[index];
    setForm({
      name: cert.name || '',
      issuer: cert.issuer || '',
      dateIssued: cert.dateIssued || '',
      expiryDate: cert.expiryDate || '',
    });
    setEditingIndex(index);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    const validationErrors = validateCertification(form);

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    if (editingIndex !== null) {
      const updated = [...cv.certifications];
      updated[editingIndex] = form;
      setCV({ ...cv, certifications: updated });
    } else {
      setCV({ ...cv, certifications: [...cv.certifications, form] });
    }

    setShowForm(false);
    setForm(initialForm);
  };

  const handleRemove = (index: number) => {
    setCV({
      ...cv,
      certifications: cv.certifications.filter((_, i) => i !== index),
    });
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Certifications & Licenses</h2>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Add Certification
          </button>
        )}
      </div>

      {/* Certifications List */}
      <div className="space-y-3 mb-6">
        {cv.certifications.map((cert, index) => (
          <div key={index} className="p-4 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-surface-900 dark:text-white">{cert.name}</h3>
                {cert.issuer && <p className="text-sm text-surface-600 dark:text-surface-400">Issued by {cert.issuer}</p>}
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-surface-500 dark:text-surface-400">
                  {cert.dateIssued && (
                    <span>Issued: {formatDateDisplay(cert.dateIssued)}</span>
                  )}
                  {cert.expiryDate && (
                    <span>Expires: {formatDateDisplay(cert.expiryDate)}</span>
                  )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Certification Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., AWS Certified Solutions Architect"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.name ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.name && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Issuing Organization (Optional)
              </label>
              <input
                type="text"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                placeholder="e.g., Amazon, Google, Microsoft"
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Issue Date (YYYY-MM) (Optional)
              </label>
              <input
                type="month"
                value={form.dateIssued}
                onChange={(e) => setForm({ ...form, dateIssued: e.target.value })}
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Expiry Date (YYYY-MM) (Optional)
              </label>
              <input
                type="month"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white ${
                  errors.expiryDate ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.expiryDate && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.expiryDate}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-600">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
            >
              <Save size={16} />
              Save Certification
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
