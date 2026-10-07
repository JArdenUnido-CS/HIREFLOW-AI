import { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, MapPin, ChevronDown, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { AddCandidateModal } from './AddCandidateModal';
import { candidatesApi } from '@/services/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  applied: 'default',
  screening: 'warning',
  shortlisted: 'warning',
  interview: 'warning',
  technical_test: 'warning',
  hr_interview: 'warning',
  offer: 'success',
  hired: 'success',
  rejected: 'danger',
};

const statusLabels: Record<string, string> = {
  applied: 'Applied',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  technical_test: 'Technical Test',
  hr_interview: 'HR Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

export function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await candidatesApi.getAll({ limit: 1000 });
      setCandidates(response.data.candidates || []);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    setUpdatingId(candidateId);
    try {
      await candidatesApi.update(candidateId, { status: newStatus });
      toast.success('Candidate status updated');
      setOpenDropdown(null);
      fetchCandidates();
    } catch (error) {
      toast.error('Failed to update candidate status');
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!deleteCandidateId) return;

    setDeletingId(deleteCandidateId);
    try {
      await candidatesApi.delete(deleteCandidateId);
      toast.success('Candidate deleted successfully');
      setDeleteCandidateId(null);
      fetchCandidates();
    } catch (error) {
      toast.error('Failed to delete candidate');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-1/4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Candidates</h1>
            <p className="text-surface-500 mt-1">{candidates.length} total candidates</p>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
            Add Candidate
          </Button>
        </div>

        {/* Search */}
        <Card padding="sm" className="p-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>
        </Card>

        {/* Candidates List */}
        {filteredCandidates.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-surface-600 dark:text-surface-400">No candidates found</p>
          </Card>
        ) : (
          <StaggerContainer className="space-y-3">
            {filteredCandidates.map((candidate) => (
              <StaggerItem key={candidate.id}>
                <Card hover className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-surface-900 dark:text-white truncate">{candidate.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-surface-500">
                        <span className="flex items-center gap-1">
                          <Mail size={12} /> {candidate.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {candidate.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {candidate.location}
                        </span>
                      </div>
                    </div>
                    {/* Status Dropdown & Delete */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === candidate.id ? null : candidate.id)}
                          disabled={updatingId === candidate.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-300 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"
                        >
                          <span className="text-xs font-medium">{statusLabels[candidate.status]}</span>
                          <ChevronDown size={14} className={cn('transition-transform', openDropdown === candidate.id && 'rotate-180')} />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdown === candidate.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg shadow-lg z-10">
                            {Object.entries(statusLabels).map(([status, label]) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(candidate.id, status)}
                                disabled={updatingId === candidate.id}
                                className={cn(
                                  'w-full text-left px-4 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors first:rounded-t-lg last:rounded-b-lg disabled:opacity-50',
                                  candidate.status === status && 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                                )}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setDeleteCandidateId(candidate.id)}
                        className="p-1.5 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors text-surface-500 hover:text-danger-600 dark:hover:text-danger-400"
                        title="Delete candidate"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Add Modal */}
        <AddCandidateModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchCandidates}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={!!deleteCandidateId}
          onClose={() => setDeleteCandidateId(null)}
          onConfirm={handleDeleteCandidate}
          loading={!!deletingId}
          title="Delete Candidate"
          message="Are you sure you want to delete this candidate? All associated data including interview records and activity logs will be removed."
          isDangerous={true}
        />
      </div>
    </PageTransition>
  );
}
