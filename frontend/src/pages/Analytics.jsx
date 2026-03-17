import React, { useState, useEffect } from 'react'
import { getAnalytics } from '../api'
import {
  PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { RefreshCw } from 'lucide-react'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await getAnalytics()
      setAnalytics(response) // ✅ fixed: was response.data
      setError(null)
    } catch (err) {
      setError('Failed to load analytics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
        {error}
      </div>
    )
  }

  const sentimentData = [
    { name: 'Positive', value: analytics?.sentiment_distribution?.positive || 0, fill: '#10b981' },
    { name: 'Negative', value: analytics?.sentiment_distribution?.negative || 0, fill: '#ef4444' },
    { name: 'Neutral',  value: analytics?.sentiment_distribution?.neutral  || 0, fill: '#f59e0b' },
  ].filter((item) => item.value > 0)

  const confidenceData = [
    { name: 'Positive', confidence: (analytics?.average_confidence?.positive || 0) * 100 },
    { name: 'Negative', confidence: (analytics?.average_confidence?.negative || 0) * 100 },
    { name: 'Neutral',  confidence: (analytics?.average_confidence?.neutral  || 0) * 100 },
  ]

  const productData = (analytics?.top_products || []).map(([name, count]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    fullName: name,
    reviews: count,
  }))

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#1e293b',
      border: '1px solid #475569',
      borderRadius: '8px',
    },
    labelStyle: { color: '#e2e8f0' },
  }

  return (
    <div className="space-y-8">
      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={fetchAnalytics}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        {sentimentData.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart - Confidence */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Average Confidence Scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="confidence" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      {productData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Top Reviewed Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={150} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="reviews" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <p className="text-slate-400 text-sm font-medium mb-2">Total Reviews</p>
          <p className="text-4xl font-bold gradient-text">{analytics?.total_reviews || 0}</p>
        </div>
        <div className="card text-center">
          <p className="text-slate-400 text-sm font-medium mb-2">Average Sentiment</p>
          <p className={`text-4xl font-bold ${
            (analytics?.average_sentiment_score || 0) > 0.3
              ? 'text-green-400'
              : (analytics?.average_sentiment_score || 0) < -0.3
              ? 'text-red-400'
              : 'text-yellow-400'
          }`}>
            {(analytics?.average_sentiment_score || 0).toFixed(2)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-slate-400 text-sm font-medium mb-2">Products Reviewed</p>
          <p className="text-4xl font-bold text-cyan-400">{productData.length}</p>
        </div>
      </div>

      {analytics?.total_reviews === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-lg">No reviews yet</p>
          <p className="text-slate-500 text-sm mt-2">Analyze some reviews to see analytics here</p>
        </div>
      )}
    </div>
  )
}