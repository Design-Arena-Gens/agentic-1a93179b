'use client'

import { useState } from 'react'

interface GeneratedVideo {
  url: string
  prompt: string
  timestamp: number
}

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videos, setVideos] = useState<GeneratedVideo[]>([])
  const [duration, setDuration] = useState('5')
  const [aspectRatio, setAspectRatio] = useState('16:9')

  const generateVideo = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, duration, aspectRatio }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video')
      }

      const newVideo: GeneratedVideo = {
        url: data.videoUrl,
        prompt: prompt,
        timestamp: Date.now(),
      }

      setVideos([newVideo, ...videos])
      setPrompt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadVideo = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `sora-video-${index + 1}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            Sora 2 <span className="gradient-text">Free</span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            AI Video Generation - No Watermarks, Unlimited & Free
          </p>
          <p className="text-sm text-gray-400">
            Create stunning videos from text descriptions
          </p>
        </div>

        {/* Generation Panel */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="mb-6">
              <label className="block text-white text-sm font-semibold mb-2">
                Video Prompt
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                rows={4}
                placeholder="Describe your video... e.g., 'A serene lakeside at sunset with mountains in the background, birds flying across the orange sky'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Duration
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={loading}
                >
                  <option value="3">3 seconds</option>
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Aspect Ratio
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 text-white border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  disabled={loading}
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                {error}
              </div>
            )}

            <button
              onClick={generateVideo}
              disabled={loading}
              className="w-full py-4 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating Video...
                </span>
              ) : (
                'Generate Video'
              )}
            </button>

            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No Watermarks
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Unlimited Use
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% Free
              </div>
            </div>
          </div>
        </div>

        {/* Generated Videos Gallery */}
        {videos.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Your Generated Videos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <div
                  key={video.timestamp}
                  className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden shadow-xl border border-white/20 hover:scale-105 transition-transform duration-200"
                >
                  <video
                    src={video.url}
                    controls
                    className="w-full aspect-video bg-black"
                    preload="metadata"
                  />
                  <div className="p-4">
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {video.prompt}
                    </p>
                    <button
                      onClick={() => downloadVideo(video.url, index)}
                      className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download (No Watermark)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p className="mb-2">
            Powered by advanced AI models • Free forever • No restrictions
          </p>
          <p className="text-xs">
            All videos are generated in real-time and delivered without watermarks
          </p>
        </div>
      </div>
    </main>
  )
}
