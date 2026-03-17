import React, { useState, useEffect } from 'react'
import { getReviews } from '../api'
import { RefreshCw, Search } from 'lucide-react'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSentiment, setFilterSentiment] = useState('all')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await getReviews()
      setReviews(response) // ✅ fixed: was response.data
      setError(null)
    } catch (err) {
      setError('Failed to load reviews')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review_text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSentiment =
      filterSentiment === 'all' || review.sentiment === filterSentiment
    return matchesSearch && matchesSentiment
  })

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'positive'
      case 'negative': return 'negative'
      default:         return 'neutral'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Search Reviews</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product or content..."
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Filter by Sentiment</label>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="input-field"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <button
            onClick={fetchReviews}
            className="btn btn-secondary flex items-center space-x-2 w-full md:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Count */}
      <div className="text-slate-400 text-sm">
        Showing {filteredReviews.length} of {reviews.length} reviews
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-blue-400">{review.product_name}</h3>
                    <span className={`sentiment-badge ${getSentimentColor(review.sentiment)}`}>
                      {review.sentiment.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 mb-4 leading-relaxed">{review.review_text}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.timestamp).toLocaleDateString()}{' '}
                    {new Date(review.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {(review.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-24 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
                      style={{ width: `${review.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-lg">No reviews found</p>
          <p className="text-slate-500 text-sm mt-2">
            {reviews.length === 0
              ? 'Start by analyzing your first review!'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      )}
    </div>
  )
}