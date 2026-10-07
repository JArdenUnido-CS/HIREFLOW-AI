import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { interviewsApi, candidatesApi } from '@/services/api';
import toast from 'react-hot-toast';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleInterviewModal({ isOpen, onClose, onSuccess }: ScheduleInterviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    candidate_id: '',
    scheduled_at: '',
    type: 'technical' as const,
  });

  useEffect(() => {
    if (isOpen) {
      fetchCandidates();
    }
  }, [isOpen]);

  const fetchCandidates = async () => {
    try {
      const response = await candidatesApi.getAll({ limit: 1000 });
      setCandidates(response.data.candidates || []);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidate_id || !formData.scheduled_at || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await interviewsApi.create({
        candidateId: formData.candidate_id,
        scheduledAt: formData.scheduled_at,
        type: formData.type,
        status: 'scheduled',
      });
      toast.success('Interview scheduled successfully');
      onClose();
      onSuccess();
      // Reset form
      setFormData({
        candidate_id: '',
        scheduled_at: '',
        type: 'technical',
      });
    } catch (error) {
      toast.error('Failed to schedule interview');
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
            <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-800">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Schedule Interview</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-200 dark:hover:bg-surface-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-surface-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Candidate *
                  </label>
                  <select
                    name="candidate_id"
                    value={formData.candidate_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                    required
                  >
                    <option value="">-- Select a candidate --</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.email})
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Date & Time *"
                  name="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={handleInputChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Interview Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                    required
                  >
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="hr">HR</option>
                    <option value="coding">Coding</option>
                    <option value="final">Final</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-800">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" loading={loading} className="flex-1">
                    Schedule
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
