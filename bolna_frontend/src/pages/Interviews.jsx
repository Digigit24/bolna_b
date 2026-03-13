import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { CalendarDays, Plus, Search, Filter, Edit, Trash2, X, Clock, User, Star } from 'lucide-react';
import PageLoader from '../components/ui/PageLoader';
import { cn } from '../lib/utils';
import useDebounce from '../hooks/useDebounce';
import { format } from 'date-fns';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('');
  const [interviewType, setInterviewType] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    candidate: '',
    job: '',
    interview_type: 'technical',
    status: 'scheduled',
    scheduled_at: '',
    interviewer: '', // Assuming integer or string depending on API
    notes: '',
    feedback: '',
    rating: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (status) params.append('status', status);
      if (interviewType) params.append('interview_type', interviewType);
      
      const res = await api.get(`/api/interviews/?${params.toString()}`);
      setInterviews(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      // Fallback dummy data for visualization
      if (!interviews.length) {
        setInterviews([
          { id: '1', candidate_name: 'Alice Smith', job_title: 'Senior Frontend Engineer', interview_type: 'technical', status: 'scheduled', scheduled_at: new Date(Date.now() + 86400000).toISOString(), rating: 0, created_at: new Date().toISOString() },
          { id: '2', candidate_name: 'Bob Johnson', job_title: 'Backend Developer', interview_type: 'hr', status: 'completed', scheduled_at: new Date(Date.now() - 86400000).toISOString(), rating: 4, feedback: 'Great communicator', created_at: new Date().toISOString() },
          { id: '3', candidate_name: 'Charlie Davis', job_title: 'Product Manager', interview_type: 'managerial', status: 'no_show', scheduled_at: new Date().toISOString(), rating: 0, created_at: new Date().toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [debouncedSearch, status, interviewType]);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ 
      candidate: '', job: '', interview_type: 'technical', 
      status: 'scheduled', scheduled_at: '', interviewer: '', 
      notes: '', feedback: '', rating: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (interview) => {
    setIsEditMode(true);
    setSelectedInterview(interview);
    // Remove the timezone/seconds for simple datetime-local picker value
    const formattedDate = interview.scheduled_at 
      ? new Date(interview.scheduled_at).toISOString().slice(0, 16) 
      : '';
      
    setFormData({
      candidate: interview.candidate || '',
      job: interview.job || '',
      interview_type: interview.interview_type || 'technical',
      status: interview.status || 'scheduled',
      scheduled_at: formattedDate,
      interviewer: interview.interviewer || '',
      notes: interview.notes || '',
      feedback: interview.feedback || '',
      rating: interview.rating || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInterview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Ensure scheduled_at is converted to ISO if it's set
      let payload = { ...formData };
      if (payload.scheduled_at) {
         payload.scheduled_at = new Date(payload.scheduled_at).toISOString();
      }

      if (isEditMode && selectedInterview) {
        await api.patch(`/api/interviews/${selectedInterview.id}/`, payload);
      } else {
        await api.post('/api/interviews/', payload);
      }
      handleCloseModal();
      fetchInterviews();
    } catch (error) {
      console.error('Failed to save interview', error);
      alert('Failed to save. Please check your data or try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete this interview with ${name}?`)) {
      try {
        await api.delete(`/api/interviews/${id}/`);
        fetchInterviews();
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Failed to delete interview');
      }
    }
  };

  const StatusBadge = ({ state }) => {
    const map = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      canceled: 'bg-gray-100 text-gray-800 border-gray-200',
      no_show: 'bg-red-100 text-red-800 border-red-200'
    };
    const mappedClass = map[state?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    return (
      <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border bg-opacity-60", mappedClass)}>
        {state ? state.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown'}
      </span>
    );
  };

  const TypeBadge = ({ type }) => {
    const map = {
      hr: 'bg-purple-100 text-purple-800 border-purple-200',
      technical: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      managerial: 'bg-amber-100 text-amber-800 border-amber-200',
      final: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    const mappedClass = map[type?.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
    return (
      <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border", mappedClass)}>
        {type || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-indigo-600 bg-indigo-100 p-1.5 rounded-xl shadow-sm" />
            Interviews
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">Schedule and evaluate candidate interviews.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-4">
          <button
            onClick={openAddModal}
            className="inline-flex items-center bg-indigo-600 text-white rounded-xl px-5 py-2.5 font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5 mr-1" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 min-w-[320px]">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="hr">HR</option>
              <option value="technical">Technical</option>
              <option value="managerial">Managerial</option>
              <option value="final">Final</option>
            </select>
          </div>
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && interviews.length === 0 ? (
        <PageLoader />
      ) : (
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80 backdrop-blur">
            <tr>
              <th className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Interview</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate & Role</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {interviews.map((interview) => (
              <tr key={interview.id} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="whitespace-nowrap py-4 pl-6 pr-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                       <Clock className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {interview.scheduled_at ? format(new Date(interview.scheduled_at), 'MMM d, h:mm a') : 'Not scheduled'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <TypeBadge type={interview.interview_type} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <div className="text-sm font-medium text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-1.5 text-gray-400"/> {interview.candidate_name || 'Unknown Candidate'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-5">
                     {interview.job_title || 'N/A'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <StatusBadge state={interview.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-amber-500 flex items-center pt-6">
                  {interview.rating ? (
                    Array.from({ length: 5 }).map((_, i) => (
                       <Star key={i} className={`h-4 w-4 ${i < interview.rating ? 'fill-current text-amber-400' : 'text-gray-300'}`} />
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Not Rated</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(interview)}
                      className="text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors"
                      title="Edit Interview"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(interview.id, interview.candidate_name)}
                      className="text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete Interview"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {interviews.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-50 rounded-full mb-4">
                    <CalendarDays className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No interviews found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or schedule a new interview.</p>
                </td>
              </tr>
            )}
            {loading && interviews.length === 0 && (
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

      {/* Modal View */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Update Interview' : 'Schedule Interview'}
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Candidate ID</label>
                  <input
                    type="text" required name="candidate"
                    value={formData.candidate} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="UUID of Candidate..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job ID</label>
                  <input
                    type="text" name="job"
                    value={formData.job} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="UUID of Job..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Interview Type</label>
                  <select
                    name="interview_type"
                    value={formData.interview_type} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all appearance-none cursor-pointer"
                  >
                    <option value="hr">HR</option>
                    <option value="technical">Technical</option>
                    <option value="managerial">Managerial</option>
                    <option value="final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <select
                    name="status"
                    value={formData.status} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all appearance-none cursor-pointer"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date & Time</label>
                  <input
                    type="datetime-local" name="scheduled_at"
                    value={formData.scheduled_at} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Interviewer ID</label>
                  <input
                    type="text" name="interviewer"
                    value={formData.interviewer} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="e.g. 1"
                  />
                </div>

                {isEditMode && formData.status === 'completed' && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rating (1-5)</label>
                    <input
                      type="number" name="rating" min="1" max="5"
                      value={formData.rating} onChange={handleChange}
                      className="w-full max-w-[150px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    name="notes" rows={2}
                    value={formData.notes} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    placeholder="General notes about scheduling or agenda..."
                  ></textarea>
                </div>
                
                {isEditMode && formData.status === 'completed' && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Feedback</label>
                    <textarea
                      name="feedback" rows={3}
                      value={formData.feedback} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                      placeholder="Detailed feedback from the interview..."
                    ></textarea>
                  </div>
                )}
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
                  {saving ? 'Saving...' : (isEditMode ? 'Update' : 'Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
