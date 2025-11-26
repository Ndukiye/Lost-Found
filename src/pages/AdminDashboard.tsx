import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useItemsStore } from '../stores/itemsStore';
import { useClaimsStore } from '../stores/claimsStore';
import { BarChart, Package, Users, Clock, CheckCircle, XCircle, Eye, Trash2, Search } from 'lucide-react';
import { Tables } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = (user?.app_metadata?.role === 'admin') || (user?.user_metadata?.role === 'admin');
  const { fetchItems, updateItem, deleteItem } = useItemsStore();
  const { fetchAllClaims, updateClaimStatus } = useClaimsStore();
  
  const [allItems, setAllItems] = useState<Tables['items']['Row'][]>([]);
  const [allClaims, setAllClaims] = useState<Tables['claims']['Row'][]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'claims' | 'analytics'>('analytics');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchItems(),
        fetchAllClaims()
      ]);
      setAllItems(useItemsStore.getState().items || []);
      setAllClaims(useClaimsStore.getState().claims || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchItems, fetchAllClaims]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  const handleItemStatusChange = async (itemId: string, newStatus: 'unclaimed' | 'claimed' | 'returned' | 'expired') => {
    try {
      await updateItem(itemId, { status: newStatus });
      setAllItems(allItems.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update item status. Please try again.');
    }
  };

  const handleClaimStatusChange = async (claimId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateClaimStatus(claimId, newStatus, user?.id || '');
      setAllClaims(allClaims.map(claim => 
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      ));
    } catch (error) {
      console.error('Error updating claim status:', error);
      alert('Failed to update claim status. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await deleteItem(itemId);
        setAllItems(allItems.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const analytics = {
    totalItems: allItems.length,
    pendingItems: allItems.filter(item => item.status === 'unclaimed').length,
    totalClaims: allClaims.length,
    pendingClaims: allClaims.filter(claim => claim.status === 'pending').length,
    approvedClaims: allClaims.filter(claim => claim.status === 'approved').length,
    rejectedClaims: allClaims.filter(claim => claim.status === 'rejected').length,
  };

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'pending' && item.status === 'unclaimed');
    return matchesSearch && matchesStatus;
  });

  const filteredClaims = allClaims.filter(claim => {
    const matchesSearch = (claim.proof_details || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campus-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage items, claims, and view analytics</p>
        </div>

        {/* Analytics Overview */}
        {activeTab === 'analytics' && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-campus-blue bg-opacity-10 rounded-lg">
                    <Package className="w-6 h-6 text-campus-blue" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalItems}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Items</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.pendingItems}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalClaims}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved Claims</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.approvedClaims}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-campus-blue text-campus-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'items'
                    ? 'border-campus-blue text-campus-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Items ({allItems.length})
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'claims'
                    ? 'border-campus-blue text-campus-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Claims ({allClaims.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filter */}
        {(activeTab === 'items' || activeTab === 'claims') && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-campus-blue focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-campus-blue focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}

        {/* Content */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No items found' : 'No items yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Items will appear here when users submit them'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900 mr-3">{item.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1 capitalize">{item.status}</span>
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>Category: {item.category}</span>
                          <span>Location: {item.location_found}</span>
                          <span>Reported: {new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => window.location.href = `/item/${item.id}`}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View Item"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <select
                          value={item.status}
                          onChange={(e) => handleItemStatusChange(item.id, e.target.value as any)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-campus-blue focus:border-transparent"
                        >
                          <option value="unclaimed">Unclaimed</option>
                          <option value="claimed">Claimed</option>
                          <option value="returned">Returned</option>
                          <option value="expired">Expired</option>
                        </select>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {filteredClaims.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No claims found' : 'No claims yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Claims will appear here when users submit them'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <div key={claim.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900 mr-3">Claim for Item ID: {claim.item_id}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                            {getStatusIcon(claim.status)}
                            <span className="ml-1 capitalize">{claim.status}</span>
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{claim.proof_details}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                          <span>Submitted: {new Date(claim.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={claim.status}
                            onChange={(e) => handleClaimStatusChange(claim.id, e.target.value as any)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-campus-blue focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approve</option>
                            <option value="rejected">Reject</option>
                          </select>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => window.location.href = `/item/${claim.item_id}`}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View Item"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
