import React, { useState } from 'react'
import { analyzeReview } from '../api'
import { Send, Loader } from 'lucide-react'

export default function AnalyzeReview() {
  const [productName, setProductName] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!productName.trim() || !reviewText.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await analyzeReview(productName, reviewText)
      setResult(response) // ✅ fixed: was response.data
      setProductName('')
      setReviewText('')

      setTimeout(() => setResult(null), 5000)
    } catch (err) {
      setError('Failed to analyze review. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'positive'
      case 'negative': return 'negative'
      default:         return 'neutral'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold gradient-text mb-8">Analyze Product Review</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name..."
              className="input-field"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review here... (minimum 10 characters recommended)"
              className="input-field min-h-40 resize-none"
              disabled={loading}
            />
            <p className="text-xs text-slate-400 mt-2">Character count: {reviewText.length}</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Analyze Review</span>
              </>
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-8 pt-8 border-t border-slate-700 animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">Analysis Result</h3>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-slate-400">Sentiment:</span>
                <span className={`sentiment-badge ${getSentimentColor(result.sentiment)}`}>
                  {result.sentiment.toUpperCase()}
                </span>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">Confidence Score</span>
                  <span className="text-blue-400 font-semibold">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>

              {result.probabilities && (
                <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
                  <h4 className="font-semibold text-slate-200 mb-4">Detailed Probabilities</h4>
                  {[
                    { label: 'Positive', value: result.probabilities.positive, color: 'bg-green-500' },
                    { label: 'Negative', value: result.probabilities.negative, color: 'bg-red-500' },
                    { label: 'Neutral',  value: result.probabilities.neutral,  color: 'bg-yellow-500' },
                  ].map((prob, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-400 text-sm">{prob.label}</span>
                        <span className="text-slate-300 text-sm font-semibold">
                          {(prob.value * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${prob.color} h-full rounded-full`}
                          style={{ width: `${prob.value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-slate-700/30 rounded-lg p-6">
                <p className="text-sm text-slate-400 mb-2">
                  Product: <span className="text-blue-400 font-semibold">{result.product_name}</span>
                </p>
                <p className="text-slate-200">{result.review_text}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">How It Works</h3>
        <ul className="space-y-3 text-slate-400">
          {[
            'Enter the product name and your review',
            'Our AI analyzes the sentiment using NLP and machine learning',
            'Get detailed sentiment classification and confidence scores',
            'The review is stored in our database for analytics',
          ].map((step, i) => (
            <li key={i} className="flex items-start space-x-3">
              <span className="text-blue-400 font-bold mt-1">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}