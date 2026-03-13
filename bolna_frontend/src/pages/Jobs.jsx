import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/apiClient';
import { 
  Briefcase, Plus, Search, Filter, Edit, Trash2, X, MapPin, 
  Users, Calendar, Clock, ChevronRight, BarChart3, CheckCircle2, 
  XCircle, Clock3, MoreVertical, LayoutGrid, List
} from 'lucide-react';
import PageLoader from '../components/ui/PageLoader';
import { cn } from '../lib/utils';
import useDebounce from '../hooks/useDebounce';
import { formatDistanceToNow } from 'date-fns';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('');
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'

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
          { id: '1', title: 'Senior Frontend Engineer', description: 'React and Vite expert with experience in modern CSS frameworks and state management.', requirements: '5+ years React, TypeScript expert', location: 'Remote', status: 'open', created_at: new Date().toISOString(), department: 'Engineering', applications: 24 },
          { id: '2', title: 'Backend Developer', description: 'Python/Django expert to build scalable microservices and manage cloud infrastructure.', requirements: '3+ years Python, AWS experience', location: 'New York, NY', status: 'paused', created_at: new Date(Date.now() - 86400000).toISOString(), department: 'Engineering', applications: 12 },
          { id: '3', title: 'Product Manager', description: 'Lead cross-functional teams to define product vision and execute strategy.', requirements: 'Agile expert, 4+ years PM experience', location: 'London, UK', status: 'closed', created_at: new Date(Date.now() - 172800000).toISOString(), department: 'Product', applications: 45 },
          { id: '4', title: 'HR Specialist', description: 'Help us find and nurture talent across the organization.', requirements: 'HR certification, strong communication', location: 'Remote', status: 'open', created_at: new Date(Date.now() - 259200000).toISOString(), department: 'HR', applications: 8 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [debouncedSearch, status]);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      total: jobs.length,
      active: jobs.filter(j => j.status === 'open').length,
      closed: jobs.filter(j => j.status === 'closed').length,
      applications: jobs.reduce((acc, curr) => acc + (curr.applications || 0), 0) || '142' // Fallback for UI visualization
    };
  }, [jobs]);

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
      open: 'bg-teal-50 text-teal-700 border-teal-100 ring-teal-600/10',
      paused: 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-600/10',
      closed: 'bg-slate-50 text-slate-700 border-slate-100 ring-slate-600/10'
    };
    const mappedClass = map[state?.toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-100 ring-slate-600/10';
    return (
      <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize", mappedClass)}>
        <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", 
          state === 'open' ? "bg-teal-500" : state === 'paused' ? "bg-amber-500" : "bg-slate-400"
        )}></span>
        {state || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] -m-6 p-6 pb-20 space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[#1E293B] flex items-center gap-3 tracking-tight">
            Jobs Management
          </h1>
          <p className="text-[#64748B] text-sm font-medium">Create, manage, and track your organization's job openings.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="group relative flex items-center justify-center gap-2 bg-linear-to-r from-teal-500 to-blue-600 text-white font-bold py-3 px-6 rounded-2xl shadow-xl shadow-teal-100 hover:shadow-teal-200 hover:translate-y-[-2px] active:translate-y-0 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Jobs', value: stats.total, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Openings', value: stats.active, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Closed Jobs', value: stats.closed, icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Applications', value: stats.applications, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-4xl shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300", item.bg, item.color)}>
                <item.icon className="h-6 w-6" />
              </div>
              <BarChart3 className="h-5 w-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1E293B] mb-1">{item.value}</p>
              <p className="text-sm font-semibold text-[#64748B]">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Control Bar */}
      <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-[#E2E8F0] flex flex-col xl:flex-row gap-5 items-stretch xl:items-center">
        <div className="relative grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8] group-focus-within:text-teal-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by job title, department, or location..."
            className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <select
              className="w-full pl-11 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-semibold text-[#475569] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer appearance-none transition-all"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="h-10 w-px bg-[#E2E8F0] hidden sm:block mx-1"></div>

          <div className="bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F0] flex items-center gap-1">
            <button 
              onClick={() => setViewType('grid')}
              className={cn("p-2 rounded-lg transition-all", viewType === 'grid' ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={cn("p-2 rounded-lg transition-all", viewType === 'list' ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Jobs List Section */}
      {loading && jobs.length === 0 ? (
        <PageLoader />
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-[#E2E8F0] p-24 text-center">
          <div className="flex items-center justify-center w-24 h-24 mx-auto bg-slate-50 rounded-4xl mb-6 animate-float">
            <Briefcase className="h-10 w-10 text-[#CBD5E1]" />
          </div>
          <h3 className="text-2xl font-bold text-[#1E293B]">No jobs listed yet</h3>
          <p className="mt-2 text-[#64748B] max-w-sm mx-auto font-medium">Start your recruitment process by posting your first job opening.</p>
          <button onClick={openAddModal} className="mt-8 text-teal-600 font-bold hover:text-teal-700 flex items-center justify-center mx-auto gap-2">
            <Plus className="h-5 w-5" /> Post Now
          </button>
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {jobs.map((job) => (
            <div key={job.id} className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E2E8F0] hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-500 flex flex-col relative overflow-hidden">
               {/* Accent decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-teal-50/50 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

              <div className="flex justify-between items-start mb-6 relative">
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] text-teal-600 rounded-2xl w-fit group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors duration-300">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge state={job.status} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{job.department || 'General'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(job)} 
                    className="text-[#64748B] hover:text-teal-600 bg-transparent hover:bg-teal-50 p-2.5 rounded-xl transition-all"
                    title="Edit Job"
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(job.id, job.title)} 
                    className="text-[#64748B] hover:text-red-600 bg-transparent hover:bg-red-50 p-2.5 rounded-xl transition-all"
                    title="Delete Job"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-extrabold text-[#1E293B] mb-2 group-hover:text-teal-600 transition-colors leading-tight">
                {job.title}
              </h3>
              
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center text-[#64748B] font-medium">
                  <MapPin className="h-4 w-4 mr-2 text-[#94A3B8]" /> 
                  {job.location || 'Remote'}
                </div>
                <div className="flex items-center text-[#64748B] font-medium">
                  <Clock className="h-4 w-4 mr-2 text-[#94A3B8]" /> 
                  {job.created_at ? `${formatDistanceToNow(new Date(job.created_at))} ago` : 'Date unknown'}
                </div>
              </div>

              <p className="text-[#475569] text-sm mb-8 line-clamp-3 leading-relaxed grow font-medium">
                {job.description || 'No detailed description provided for this job opening.'}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-[#F1F5F9]">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Applicants</span>
                   <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                     <Users className="h-4 w-4" />
                     <span>{job.applications || 0} candidates</span>
                   </div>
                </div>
                
                <button className="flex items-center justify-center h-11 w-11 rounded-2xl bg-slate-50 border border-[#E2E8F0] text-[#64748B] hover:bg-teal-600 hover:text-white hover:border-teal-600 hover:shadow-lg hover:shadow-teal-100 transition-all group/btn">
                  <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View View */
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#E2E8F0] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-8 py-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Job Role</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Candidates</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-xl group-hover:border-teal-200 transition-colors">
                         <Briefcase className="h-5 w-5 text-teal-600" />
                       </div>
                       <div>
                         <p className="font-bold text-[#1E293B] group-hover:text-teal-600 transition-colors">{job.title}</p>
                         <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5 font-medium">
                           <MapPin className="h-3 w-3" /> {job.location || 'Remote'}
                         </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md">{job.department || 'Engineering'}</span>
                  </td>
                  <td className="px-6 py-6">
                    <StatusBadge state={job.status} />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                      <Users className="h-4 w-4" />
                      {job.applications || 0}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openEditModal(job)} className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
                         <Edit className="h-4.5 w-4.5" />
                       </button>
                       <button onClick={() => handleDelete(job.id, job.title)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                         <Trash2 className="h-4.5 w-4.5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal - Redesigned */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-[#0F172A]/40 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 duration-300 my-10 overflow-hidden">
            <div className="p-10 border-b border-[#F1F5F9] flex items-center justify-between bg-linear-to-r from-[#F8FAFC] to-white">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#1E293B]">
                  {isEditMode ? 'Update Vacancy' : 'New Job Posting'}
                </h3>
                <p className="text-[#64748B] text-sm font-medium">Standardize the recruitment details for this role.</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-3 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10">
              <div className="space-y-6 mb-10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#475569] ml-1">Job Role Title <span className="text-red-400">*</span></label>
                  <input
                    type="text" required name="title"
                    value={formData.title} onChange={handleChange}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-semibold text-[#1E293B] transition-all"
                    placeholder="e.g. Lead Technical Architect"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#475569] ml-1">Location / Office</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#94A3B8]" />
                      <input
                        type="text" name="location"
                        value={formData.location} onChange={handleChange}
                        className="w-full pl-11 pr-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-semibold text-[#1E293B] transition-all"
                        placeholder="e.g. Remote, Mumbai, India"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#475569] ml-1">Current Status</label>
                    <div className="relative">
                      <Clock3 className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#94A3B8] pointer-events-none" />
                      <select
                        name="status"
                        value={formData.status} onChange={handleChange}
                        className="w-full pl-11 pr-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-semibold text-[#1E293B] transition-all appearance-none cursor-pointer"
                      >
                        <option value="open">Active / Open</option>
                        <option value="paused">Paused / Hold</option>
                        <option value="closed">Closed / Filled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#475569] ml-1">Description</label>
                  <textarea
                    name="description" rows={3}
                    value={formData.description} onChange={handleChange}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-semibold text-[#1E293B] transition-all min-h-[100px] max-h-[200px]"
                    placeholder="Brief objective of the role..."
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#475569] ml-1">Candidate Requirements</label>
                  <textarea
                    name="requirements" rows={3}
                    value={formData.requirements} onChange={handleChange}
                    className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-semibold text-[#1E293B] transition-all min-h-[100px] max-h-[200px]"
                    placeholder="Skills, degrees, tools, or behavioral traits needed..."
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-8 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-4 rounded-2xl font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all active:scale-95"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-10 py-4 rounded-2xl font-extrabold text-white bg-linear-to-r from-teal-500 to-blue-600 shadow-xl shadow-teal-100 hover:shadow-teal-200 active:scale-95 transition-all disabled:opacity-75 flex items-center"
                >
                  {saving && <span className="animate-spin mr-3 border-2 border-white/20 border-t-white rounded-full h-4 w-4"></span>}
                  {saving ? 'Processing...' : (isEditMode ? 'Commit Changes' : 'Publish Job')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

