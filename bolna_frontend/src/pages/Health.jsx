import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { Activity, CheckCircle, AlertTriangle, RefreshCw, Server, Database } from 'lucide-react';
import PageLoader from '../components/ui/PageLoader';

export default function Health() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/health/');
      setHealthData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching health status:', err);
      setError('Failed to fetch system health status. The service might be down.');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (statusValue) => {
    if (!statusValue) return 'bg-gray-100 text-gray-800 border-gray-200';
    const lower = String(statusValue).toLowerCase();
    if (lower === 'ok' || lower === 'healthy' || lower === 'up' || statusValue === true) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (lower === 'warning' || lower === 'degraded') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusIcon = (statusValue) => {
    if (!statusValue) return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    const lower = String(statusValue).toLowerCase();
    if (lower === 'ok' || lower === 'healthy' || lower === 'up' || statusValue === true) {
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Activity className="h-8 w-8 text-indigo-600 bg-indigo-100 p-1.5 rounded-xl shadow-sm" />
            System Health
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">Real-time monitoring of backend services and integrations.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-4 items-center">
          {lastUpdated && (
            <span className="text-xs text-gray-500 font-medium">
              Last checked: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-6 border border-red-100 shadow-sm mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-bold text-red-800">Connection Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && !healthData && !error ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Status */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`p-4 rounded-2xl ${healthData ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                <Server className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">API Server</h3>
                <p className="mt-1 text-gray-500">Core backend application service</p>
              </div>
            </div>
            <div>
              <span className={`px-4 py-2 text-sm font-bold rounded-full border ${healthData ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                {healthData ? 'Online & Healthy' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Details Mapping */}
          {healthData && Object.entries(healthData).map(([key, value]) => {
            // We can try to nicely format common health nested structures if needed, or simply render primitive values
            const isObject = typeof value === 'object' && value !== null;
            
            return (
              <div key={key} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-50 p-2 rounded-xl text-indigo-500">
                       <Activity className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h4>
                  </div>
                  {!isObject && getStatusIcon(value)}
                </div>
                
                <div className="mt-4">
                  {isObject ? (
                     <pre className="bg-gray-50 rounded-xl p-4 text-xs font-mono text-gray-700 overflow-x-auto border border-gray-100">
                       {JSON.stringify(value, null, 2)}
                     </pre>
                  ) : (
                    <div className="flex items-center space-x-2">
                       <span className="text-sm font-medium text-gray-500">Status:</span>
                       <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(value)} capitalize`}>
                         {String(value)}
                       </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
