import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useItemsStore } from '../stores/itemsStore'
import { Search, MapPin, Calendar, User, PlusCircle, Eye } from 'lucide-react'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { items, categories, loading, fetchItems, fetchCategories } = useItemsStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems({ status: 'unclaimed' })
    fetchCategories()
  }, [fetchItems, fetchCategories])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/items/search?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`)
  }

  const recentItems = items.slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
              <Search className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Campus Lost & Found
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Helping students and staff reunite with their lost belongings. 
              Report lost items, search for found items, and make claims with ease.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/items/submit"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Report Lost/Found Item
            </Link>
            <Link
              to="/items/search"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Search className="h-5 w-5 mr-2" />
              Search Items
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    What are you looking for?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search by item name, description, or keywords..."
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Search Items
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recently Found Items
            </h2>
            <p className="text-lg text-gray-600">
              Check out the latest items that have been found on campus
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading recent items...</p>
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-6 inline-flex items-center justify-center mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No recent items found
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to report a found item and help someone find their lost belongings.
              </p>
              <Link
                to="/items/submit"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Submit an Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center">
                        <Search className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Found
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.description || 'No description available'}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{item.location_found}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(item.date_found).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      to={`/items/${item.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/items/search"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              View All Items
              <Eye className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to help you find or report lost items
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 inline-flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Search or Report
              </h3>
              <p className="text-gray-600">
                Look for your lost item in our database or report a found item to help others.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 inline-flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Create Account
              </h3>
              <p className="text-gray-600">
                Sign up with your campus email to submit items and make claims.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 inline-flex items-center justify-center mb-4">
                <PlusCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Claim or Manage
              </h3>
              <p className="text-gray-600">
                Claim items you've lost or manage your submitted items through your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}