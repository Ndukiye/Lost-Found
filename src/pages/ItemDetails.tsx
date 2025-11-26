import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useItemsStore } from '../stores/itemsStore'
import { useClaimsStore } from '../stores/claimsStore'
import { useAuthStore } from '../stores/authStore'
import { MapPin, Calendar, User, Tag, Eye, MessageCircle, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [claimDetails, setClaimDetails] = useState('')
  const [submittingClaim, setSubmittingClaim] = useState(false)
  
  const { user } = useAuthStore()
  const { items, fetchItemById, loading } = useItemsStore()
  const { createClaim } = useClaimsStore()
  
  const item = items.find(item => item.id === id)

  useEffect(() => {
    if (id) {
      fetchItemById(id)
    }
  }, [id, fetchItemById])

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!claimDetails.trim()) {
      alert('Please provide proof of ownership details')
      return
    }

    if (!user) {
      alert('Please sign in to make a claim')
      navigate('/auth/login')
      return
    }

    setSubmittingClaim(true)
    try {
      await createClaim({
        item_id: id!,
        proof_details: claimDetails,
        status: 'pending',
      })
      
      alert('Your claim has been submitted successfully! You will be notified once it is reviewed.')
      setShowClaimForm(false)
      setClaimDetails('')
    } catch (error) {
      console.error('Error submitting claim:', error)
      alert('Failed to submit claim. Please try again.')
    } finally {
      setSubmittingClaim(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full p-6 inline-flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Item Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The item you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/items/search')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse All Items
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Item Image */}
          <div className="aspect-w-16 aspect-h-9 bg-gray-200">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center">
                <Eye className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Found
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  <Tag className="h-4 w-4 inline mr-1" />
                  {item.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {item.title}
              </h1>
              <p className="text-lg text-gray-600">
                {item.description || 'No description provided'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Location Found</span>
                </div>
                <p className="text-gray-700">{item.location_found}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Date Found</span>
                </div>
                <p className="text-gray-700">{new Date(item.date_found).toLocaleDateString()}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Reported By</span>
                </div>
                <p className="text-gray-700">Campus Staff/Student</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Status</span>
                </div>
                <p className="text-gray-700 capitalize">{item.status.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {user && item.owner_id !== user.id && item.status === 'unclaimed' && (
                <button
                  onClick={() => setShowClaimForm(true)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Claim This Item
                </button>
              )}
              
              <button
                onClick={() => navigate('/items/search')}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>

        {/* Claim Form Modal */}
        {showClaimForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Claim Item: {item.title}
                </h3>
                <button
                  onClick={() => setShowClaimForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Please provide detailed proof of ownership:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Describe unique features, serial numbers, or identifying marks</li>
                      <li>Provide details about when and where you lost the item</li>
                      <li>Include any photos or documents that prove ownership</li>
                      <li>Be as specific as possible to help us verify your claim</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleClaim} className="space-y-4">
                <div>
                  <label htmlFor="claim-details" className="block text-sm font-medium text-gray-700 mb-1">
                    Proof of Ownership *
                  </label>
                  <textarea
                    id="claim-details"
                    rows={6}
                    value={claimDetails}
                    onChange={(e) => setClaimDetails(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide detailed information to prove this item belongs to you..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowClaimForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}