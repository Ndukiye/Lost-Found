import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useItemsStore } from '../stores/itemsStore';
import { useClaimsStore } from '../stores/claimsStore';
import { Search, Package, Clock, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { fetchItems, deleteItem } = useItemsStore();
  const { fetchClaims } = useClaimsStore();
  
  const [userItems, setUserItems] = useState<any[]>([]);
  const [userClaims, setUserClaims] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'claims'>('items');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [items, claims] = await Promise.all([
        fetchItems({ owner_id: user!.id }).then(() => useItemsStore.getState().items),
        fetchClaims().then(() => useClaimsStore.getState().claims)
      ]);
      setUserItems(items || []);
      setUserClaims(claims || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchItems, fetchClaims]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(itemId);
        setUserItems(userItems.filter(item => item.id !== itemId));
      } catch (error) {
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-campus-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredItems = userItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClaims = userClaims.filter(claim => 
    claim.proof_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your lost items and track your claims</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-campus-blue bg-opacity-10 rounded-lg">
                <Package className="w-6 h-6 text-campus-blue" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{userItems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userClaims.filter(claim => claim.status === 'pending').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {userClaims.filter(claim => claim.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('items')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'items'
                    ? 'border-campus-blue text-campus-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Items ({userItems.length})
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'claims'
                    ? 'border-campus-blue text-campus-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Claims ({userClaims.length})
              </button>
            </nav>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-campus-blue focus:border-transparent"
            />
          </div>
        </div>

        {activeTab === 'items' ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No items found' : 'No items yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try adjusting your search' : 'Start by reporting a lost item'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => window.location.href = '/submit'}
                    className="bg-campus-blue text-white px-4 py-2 rounded-lg hover:bg-campus-blue-dark transition-colors"
                  >
                    Report Lost Item
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900 mr-3">{item.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                            item.status === 'approved' ? 'text-green-600 bg-green-50' :
                            'text-gray-600 bg-gray-50'
                          }`}>
                            {item.status}
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
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {filteredClaims.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No claims found' : 'No claims yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search' : 'Your claims will appear here'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <div key={claim.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900 mr-3">Claim for Item</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            claim.status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                            claim.status === 'approved' ? 'text-green-600 bg-green-50' :
                            'text-red-600 bg-red-50'
                          }`}>
                            {claim.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{claim.proof_description}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>Contact: {claim.contact_info}</span>
                          <span>Submitted: {new Date(claim.created_at).toLocaleDateString()}</span>
                        </div>
                        {claim.admin_notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 mb-1">Admin Notes:</p>
                            <p className="text-sm text-gray-600">{claim.admin_notes}</p>
                          </div>
                        )}
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

export default UserDashboard;
