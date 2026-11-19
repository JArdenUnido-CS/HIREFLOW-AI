import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientJobsApi, ClientJobsQueryParams } from '@/services/api';
import { Job } from '@/types';
import { JobCard } from './JobCard';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'Java', 'SQL', 'AWS', 'Docker', 'Git',
  'Communication', 'Leadership', 'Problem Solving', 'Team Work',
];

export function JobSearchPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [typesOpen, setTypesOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);

  // Pagination
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  // Fetch jobs with current filters
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: ClientJobsQueryParams = {
          limit,
          offset,
          search: searchTerm || undefined,
          location: selectedLocation || undefined,
          type: selectedType || undefined,
          skills: selectedSkills.length > 0 ? selectedSkills : undefined,
        };

        const response = await clientJobsApi.browse(params);
        const newJobs = response.data.jobs || [];
        
        if (offset === 0) {
          setJobs(newJobs);
        } else {
          setJobs(prev => [...prev, ...newJobs]);
        }

        setHasMore(newJobs.length === limit);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchTerm, selectedLocation, selectedType, selectedSkills, offset, limit]);

  // Reset offset when filters change
  const handleFilterChange = () => {
    setOffset(0);
  };

  const handleAddSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      handleFilterChange();
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
    handleFilterChange();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedType('');
    setSelectedSkills([]);
    setOffset(0);
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  const hasActiveFilters =
    searchTerm || selectedLocation || selectedType || selectedSkills.length > 0;

  // Extract unique locations from current jobs for suggestions
  const availableLocations = Array.from(
    new Set(jobs.map(job => job.location).filter(Boolean))
  ).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50">
          Discover Opportunities
        </h1>
        <p className="text-surface-600 dark:text-surface-400">
          {jobs.length > 0 ? `Showing ${jobs.length} job${jobs.length !== 1 ? 's' : ''}` : 'Find your next role'}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-surface-400" size={20} />
        <input
          type="text"
          placeholder="Search by job title, company, skills..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleFilterChange();
          }}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Filters and active filter chips */}
      <div className="space-y-3">
        {/* Filter buttons row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all',
              filterOpen
                ? 'border-brand-300 bg-brand-50 dark:border-brand-600 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'
            )}
          >
            <Filter size={18} />
            Filters
            <ChevronDown size={16} className={`transform transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2"
            >
              {selectedLocation && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
                  <span>Location: {selectedLocation}</span>
                  <button
                    onClick={() => {
                      setSelectedLocation('');
                      handleFilterChange();
                    }}
                    className="hover:opacity-70"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedType && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm">
                  <span>Type: {selectedType}</span>
                  <button
                    onClick={() => {
                      setSelectedType('');
                      handleFilterChange();
                    }}
                    className="hover:opacity-70"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedSkills.map(skill => (
                <div
                  key={skill}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:opacity-70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expandable filter panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
                {/* Location filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                    Location
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setLocationsOpen(!locationsOpen)}
                      className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 text-sm text-left flex items-center justify-between hover:border-surface-400 dark:hover:border-surface-500 transition-colors"
                    >
                      <span>{selectedLocation || 'Select location...'}</span>
                      <ChevronDown size={16} className={`transform ${locationsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {locationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-20 top-full mt-1 w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 shadow-lg"
                        >
                          <div className="max-h-40 overflow-y-auto">
                            {availableLocations.map(location => (
                              <button
                                key={location}
                                onClick={() => {
                                  setSelectedLocation(location);
                                  setLocationsOpen(false);
                                  handleFilterChange();
                                }}
                                className={cn(
                                  'w-full text-left px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors',
                                  selectedLocation === location
                                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                                    : 'text-surface-700 dark:text-surface-300'
                                )}
                              >
                                {location}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Employment type filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                    Employment Type
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setTypesOpen(!typesOpen)}
                      className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 text-sm text-left flex items-center justify-between hover:border-surface-400 dark:hover:border-surface-500 transition-colors"
                    >
                      <span>{selectedType || 'Select type...'}</span>
                      <ChevronDown size={16} className={`transform ${typesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {typesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-20 top-full mt-1 w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 shadow-lg"
                        >
                          {EMPLOYMENT_TYPES.map(type => (
                            <button
                              key={type.value}
                              onClick={() => {
                                setSelectedType(type.value);
                                setTypesOpen(false);
                                handleFilterChange();
                              }}
                              className={cn(
                                'w-full text-left px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors',
                                selectedType === type.value
                                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                                  : 'text-surface-700 dark:text-surface-300'
                              )}
                            >
                              {type.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Skills filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                    Skills
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setSkillsOpen(!skillsOpen)}
                      className="w-full px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 text-sm text-left flex items-center justify-between hover:border-surface-400 dark:hover:border-surface-500 transition-colors"
                    >
                      <span>{selectedSkills.length > 0 ? `${selectedSkills.length} selected` : 'Select skills...'}</span>
                      <ChevronDown size={16} className={`transform ${skillsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {skillsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-20 top-full mt-1 w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 shadow-lg"
                        >
                          <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                            {COMMON_SKILLS.map(skill => (
                              <button
                                key={skill}
                                onClick={() => {
                                  if (selectedSkills.includes(skill)) {
                                    handleRemoveSkill(skill);
                                  } else {
                                    handleAddSkill(skill);
                                  }
                                }}
                                className={cn(
                                  'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                                  selectedSkills.includes(skill)
                                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
                                )}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      {error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-6 text-center">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-surface-600 dark:text-surface-400 text-lg">
            {loading ? 'Loading jobs...' : 'No jobs found. Try adjusting your filters.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Job grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
