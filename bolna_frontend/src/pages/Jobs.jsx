import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { Briefcase, Plus, Search, Filter, Edit, Trash2, X, MapPin, Users } from 'lucide-react';
import PageLoader from '../components/ui/PageLoader';
import { cn } from '../lib/utils';
import useDebounce from '../hooks/useDebounce';
import { format, formatDistanceToNow } from 'date-fns';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    status: 'open'
  });
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (status) params.append('status', status);
      
      const res = await api.get(`/api/jobs/?${params.toString()}`);
      setJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      // Fallback dummy data for visualization
      if (!jobs.length) {
        setJobs([
          { id: '1', title: 'Senior Frontend Engineer', description: 'React and Vite expert', requirements: '5+ years React', location: 'Remote', status: 'open', created_at: new Date().toISOString() },
          { id: '2', title: 'Backend Developer', description: 'Python/Django expert', requirements: '3+ years Python', location: 'New York, NY', status: 'paused', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: '3', title: 'Product Manager', description: 'Lead the team', requirements: 'Agile expert', location: 'London, UK', status: 'closed', created_at: new Date(Date.now() - 172800000).toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [debouncedSearch, status]);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ 
      title: '', description: '', requirements: '', 
      location: '', status: 'open' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setIsEditMode(true);
    setSelectedJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      location: job.location || '',
      status: job.status || 'open'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditMode && selectedJob) {
        await api.patch(`/api/jobs/${selectedJob.id}/`, formData);
      } else {
        await api.post('/api/jobs/', formData);
      }
      handleCloseModal();
      fetchJobs();
    } catch (error) {
      console.error('Failed to save job', error);
      alert('Failed to save. Please check your data or try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the job: ${title}?`)) {
      try {
        await api.delete(`/api/jobs/${id}/`);
        fetchJobs();
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Failed to delete job');
      }
    }
  };

  const StatusBadge = ({ state }) => {
    const map = {
      open: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      paused: 'bg-amber-100 text-amber-800 border-amber-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    const mappedClass = map[state?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    return (
      <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border bg-opacity-60 capitalize", mappedClass)}>
        {state || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-indigo-600 bg-indigo-100 p-1.5 rounded-xl shadow-sm" />
            Job Postings
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">Manage open roles and company requirements.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-4">
          <button
            onClick={openAddModal}
            className="inline-flex items-center bg-indigo-600 text-white rounded-xl px-5 py-2.5 font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5 mr-1" />
            Create Job
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search job titles or descriptions..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Listing (Grid Layout) */}
      {loading && jobs.length === 0 ? (
        <PageLoader />
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-50 rounded-full mb-4">
            <Briefcase className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or create a new job posting.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
               {job.status === 'closed' && (
                 <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute transform rotate-45 bg-gray-200 text-gray-600 text-[10px] font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center border-y border-gray-300">
                      CLOSED
                    </div>
                 </div>
               )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl flex-shrink-0">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(job)} className="text-indigo-600 bg-indigo-50 p-2 rounded-xl hover:bg-indigo-100 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(job.id, job.title)} className="text-red-600 bg-red-50 p-2 rounded-xl hover:bg-red-100 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-4">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-gray-400"/> {job.location || 'Remote'}</span>
                {job.created_at && (
                   <span className="text-xs">{formatDistanceToNow(new Date(job.created_at))} ago</span>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                {job.description || 'No description provided for this job.'}
              </p>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                <StatusBadge state={job.status} />
                <div className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1" /> View Candidates
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Job Posting' : 'Create Job Posting'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
                  <input
                    type="text" required name="title"
                    value={formData.title} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                    <input
                      type="text" name="location"
                      value={formData.location} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                      placeholder="e.g. Remote, San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                    <select
                      name="status"
                      value={formData.status} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all appearance-none cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    name="description" rows={4}
                    value={formData.description} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="A detailed description of the role and responsibilities..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Requirements</label>
                  <textarea
                    name="requirements" rows={3}
                    value={formData.requirements} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="Specific skills, years of experience, etc..."
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-75 flex items-center"
                >
                  {saving && <span className="animate-spin mr-2 border-2 border-white/20 border-t-white rounded-full h-4 w-4"></span>}
                  {saving ? 'Saving...' : (isEditMode ? 'Update Job' : 'Create Job')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
