import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Rocket, ExternalLink } from 'lucide-react';
import { validateProject } from '../cvValidation';
import type { ParsedCV } from '../CVBuilder';

interface ProjectsSectionProps {
  cv: ParsedCV;
  setCV: (cv: ParsedCV) => void;
}

interface ProjectForm {
  name: string;
  description: string;
  technologies: string;
  url: string;
  startDate: string;
  endDate: string;
}

const initialForm: ProjectForm = {
  name: '',
  description: '',
  technologies: '',
  url: '',
  startDate: '',
  endDate: '',
};

export function ProjectsSection({ cv, setCV }: ProjectsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ProjectForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddClick = () => {
    setEditingIndex(null);
    setForm(initialForm);
    setErrors({});
    setShowForm(true);
  };

  const handleEditClick = (index: number) => {
    const proj = cv.projects[index];
    setForm({
      name: proj.name || '',
      description: proj.description || '',
      technologies: (proj.technologies || []).join(', '),
      url: proj.url || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
    });
    setEditingIndex(index);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    const technologiesArray = form.technologies
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const validationErrors = validateProject({
      name: form.name,
      description: form.description,
      technologies: technologiesArray,
      url: form.url,
      startDate: form.startDate,
      endDate: form.endDate,
    });

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    const newProject = {
      name: form.name,
      description: form.description,
      technologies: technologiesArray,
      url: form.url || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };

    if (editingIndex !== null) {
      const updated = [...cv.projects];
      updated[editingIndex] = newProject;
      setCV({ ...cv, projects: updated });
    } else {
      setCV({ ...cv, projects: [...cv.projects, newProject] });
    }

    setShowForm(false);
    setForm(initialForm);
  };

  const handleRemove = (index: number) => {
    setCV({
      ...cv,
      projects: cv.projects.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Rocket className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Projects</h2>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
          >
            <Plus size={16} />
            Add Project
          </button>
        )}
      </div>

      {/* Projects List */}
      <div className="space-y-3 mb-6">
        {cv.projects.map((project, index) => (
          <div key={index} className="p-4 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-surface-900 dark:text-white">{project.name}</h3>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-surface-200 dark:hover:bg-surface-600 rounded transition-colors"
                    >
                      <ExternalLink size={14} className="text-blue-600 dark:text-blue-400" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.technologies.map((tech: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
                {(project.startDate || project.endDate) && (
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">
                    {project.startDate} {project.endDate ? `- ${project.endDate}` : ''}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., E-Commerce Platform"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.name ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.name && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the project and your role"
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.description ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.description && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.description}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Technologies (comma-separated) *
              </label>
              <textarea
                value={form.technologies}
                onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                placeholder="React, Node.js, PostgreSQL, Docker"
                rows={2}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.technologies ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.technologies && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.technologies}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Project URL (Optional)
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://example.com"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400 ${
                  errors.url ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'
                }`}
              />
              {errors.url && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.url}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Start Date (YYYY-MM) (Optional)
              </label>
              <input
                type="month"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                End Date (YYYY-MM) (Optional)
              </label>
              <input
                type="month"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-600">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
            >
              <Save size={16} />
              Save Project
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
