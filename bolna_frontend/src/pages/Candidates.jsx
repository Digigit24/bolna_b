import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { Users, Plus, Search, Filter, Edit, Trash2, X, FileText, CheckCircle, Mail, Phone, Briefcase, ChevronDown } from 'lucide-react';
import PageLoader from '../components/ui/PageLoader';
import { cn } from '../lib/utils';
import useDebounce from '../hooks/useDebounce';
import { format } from 'date-fns';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    job: '', // assuming string ID depending on your backend
    experience_years: 0,
    skills: '',
    status: 'new'
  });
  const [saving, setSaving] = useState(false);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (status) params.append('status', status);
      
      const res = await api.get(`/api/candidates/?${params.toString()}`);
      setCandidates(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      // Fallback dummy data for visualization
      if (!candidates.length) {
        setCandidates([
          { id: '1', name: 'Alice Smith', email: 'alice@example.com', phone: '+1234567890', job_title: 'Senior Frontend Engineer', experience_years: 5, skills: 'React, Node.js', status: 'new', created_at: new Date().toISOString() },
          { id: '2', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1987654321', job_title: 'Backend Developer', experience_years: 3, skills: 'Python, Django', status: 'screening', created_at: new Date().toISOString() },
          { id: '3', name: 'Charlie Davis', email: 'charlie@example.com', phone: '+1122334455', job_title: 'Product Manager', experience_years: 8, skills: 'Agile, Scrum', status: 'qualified', created_at: new Date().toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [debouncedSearch, status]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/api/jobs/');
        setJobs(res.data.results || res.data || []);
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      }
    };
    fetchJobs();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ name: '', email: '', phone: '', job: '', experience_years: 0, skills: '', status: 'new' });
    setIsModalOpen(true);
  };

  const openEditModal = (candidate) => {
    setIsEditMode(true);
    setSelectedCandidate(candidate);
    setFormData({
      name: candidate.name || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      job: candidate.job || '',
      experience_years: candidate.experience_years || 0,
      skills: candidate.skills || '',
      status: candidate.status || 'new'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditMode && selectedCandidate) {
        await api.patch(`/api/candidates/${selectedCandidate.id}/`, formData);
      } else {
        await api.post('/api/candidates/', formData);
      }
      handleCloseModal();
      fetchCandidates();
    } catch (error) {
      console.error('Failed to save candidate', error);
      alert('Failed to save. Please check your data or try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/api/candidates/${id}/`);
        fetchCandidates();
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Failed to delete candidate');
      }
    }
  };

  const StatusBadge = ({ state }) => {
    const map = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      screening: 'bg-amber-100 text-amber-800 border-amber-200',
      qualified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      hired: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    const mappedClass = map[state?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    return (
      <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border bg-opacity-60", mappedClass)}>
        {state ? state.charAt(0).toUpperCase() + state.slice(1) : 'Unknown'}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600 bg-indigo-100 p-1.5 rounded-xl shadow-sm" />
            Candidates Pipeline
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">Manage and track candidates through stages.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-4">
          <button
            onClick={openAddModal}
            className="inline-flex items-center bg-indigo-600 text-white rounded-xl px-5 py-2.5 font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates by name, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none transition-all hover:bg-gray-100"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="screening">Screening</option>
            <option value="qualified">Qualified</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
        </div>
      </div>

      {loading && candidates.length === 0 ? (
        <PageLoader />
      ) : (
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80 backdrop-blur">
            <tr>
              <th className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name & Contact</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Exp.</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date Added</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {candidates.map((cand) => (
              <tr key={cand.id} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="whitespace-nowrap py-4 pl-6 pr-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                      {cand.name ? cand.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">{cand.name || 'Unnamed'}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1 inline" /> {cand.email || '—'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <div className="text-sm font-medium text-gray-900">{cand.job_title || 'N/A'}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center">
                    <Briefcase className="h-3 w-3 mr-1" /> {cand.experience_years || 0} Years Exp.
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <StatusBadge state={cand.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-medium">
                  {cand.created_at ? format(new Date(cand.created_at), 'MMM d, yyyy') : '—'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(cand)}
                      className="text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors"
                      title="Edit Candidate"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cand.id, cand.name)}
                      className="text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete Candidate"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {candidates.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-50 rounded-full mb-4">
                    <Users className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or add a new candidate.</p>
                </td>
              </tr>
            )}
            {loading && candidates.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Candidate' : 'Add New Candidate'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text" required name="name"
                    value={formData.name} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email" required name="email"
                    value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                  <input
                    type="text" required name="phone"
                    value={formData.phone} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Posting (Optional)</label>
                  <div className="relative group">
                    <select
                      name="job"
                      value={formData.job} onChange={handleChange}
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all appearance-none cursor-pointer hover:border-gray-300"
                    >
                      <option value="">Select a Job</option>
                      {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience (Years)</label>
                  <input
                    type="number" name="experience_years" min="0" step="1"
                    value={formData.experience_years} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Skills</label>
                  <input
                    type="text" name="skills"
                    value={formData.skills} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                    placeholder="React, Typescript, Next.js..."
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <div className="relative group">
                    <select
                      name="status"
                      value={formData.status} onChange={handleChange}
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all appearance-none cursor-pointer hover:border-gray-300"
                    >
                      <option value="new">New</option>
                      <option value="screening">Screening</option>
                      <option value="qualified">Qualified</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                  </div>
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
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-75 disabled:active:scale-100 flex items-center"
                >
                  {saving && <span className="animate-spin mr-2 border-2 border-white/20 border-t-white rounded-full h-4 w-4"></span>}
                  {saving ? 'Saving...' : (isEditMode ? 'Update Candidate' : 'Save Candidate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
