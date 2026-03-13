import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { Building2, Plus, Search, Edit, X, Check, ShieldAlert, Globe } from 'lucide-react';
import PageLoader from '../components/ui/PageLoader';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const res = await api.get(`/api/organizations/?${params.toString()}`);
      setOrganizations(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      // Fallback dummy data
      if (organizations.length === 0) {
        setOrganizations([
          { id: '1', name: 'Acme Corp', slug: 'acme-corp', is_active: true, created_at: new Date().toISOString() },
          { id: '2', name: 'Globex', slug: 'globex', is_active: false, created_at: new Date().toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [search]);

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ name: '', slug: '', is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (org) => {
    setIsEditMode(true);
    setSelectedOrg(org);
    setFormData({
      name: org.name || '',
      slug: org.slug || '',
      is_active: org.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrg(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditMode && selectedOrg) {
        await api.patch(`/api/organizations/${selectedOrg.id}/`, formData);
      } else {
        await api.post('/api/organizations/', formData);
      }
      handleCloseModal();
      fetchOrganizations();
    } catch (error) {
      console.error('Failed to save organization', error);
      alert('Failed to save organization. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const StatusBadge = ({ active }) => (
    <span className={cn(
      "px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center w-fit gap-1",
      active 
        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
        : "bg-red-50 text-red-700 border-red-100"
    )}>
      {active ? <Check className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
      {active ? 'Active' : 'Inactive'}
    </span>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-indigo-600 bg-indigo-100 p-1.5 rounded-xl shadow-sm" />
            Organizations
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">Manage client organizations and business entities.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-4">
          <button
            onClick={openAddModal}
            className="inline-flex items-center bg-indigo-600 text-white rounded-xl px-5 py-2.5 font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5 mr-1" />
            New Organization
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search organizations by name or slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && organizations.length === 0 ? (
        <PageLoader />
      ) : (
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80 backdrop-blur">
            <tr>
              <th className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Organization Name</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {organizations.map((org) => (
              <tr key={org.id} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="whitespace-nowrap py-4 pl-6 pr-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-700">
                      {org.name ? org.name.charAt(0).toUpperCase() : 'O'}
                    </div>
                    <div className="ml-4 font-semibold text-gray-900">{org.name}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <div className="flex items-center text-sm text-gray-500 font-mono">
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    {org.slug}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <StatusBadge active={org.is_active} />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-medium">
                  {org.created_at ? format(new Date(org.created_at), 'MMM d, yyyy') : '—'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button 
                    onClick={() => openEditModal(org)}
                    className="text-indigo-600 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit Organization"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {organizations.length === 0 && !loading && (
          <div className="py-20 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No organizations found</h3>
            <p className="text-gray-500">Add your first organization to get started.</p>
          </div>
        )}
      </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Edit Organization' : 'Create Organization'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization Name</label>
                <input
                  type="text" required name="name"
                  value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug (URL identifier)</label>
                <input
                  type="text" required name="slug"
                  value={formData.slug} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm transition-all font-mono"
                  placeholder="e.g. acme-corp"
                />
              </div>
              <div className="flex items-center gap-3 px-1">
                <input
                  type="checkbox" name="is_active" id="is_active"
                  checked={formData.is_active} onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Mark as Active</label>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button" onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-75 flex items-center"
                >
                  {saving && <span className="animate-spin mr-2 border-2 border-white/20 border-t-white rounded-full h-4 w-4"></span>}
                  {isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
