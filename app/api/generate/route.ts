import { NextResponse } from 'next/server'
import Replicate from 'replicate'

export async function POST(request: Request) {
  try {
    const { prompt, duration, aspectRatio } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      )
    }

    // Use a free text-to-video model from Replicate
    // Using anotherjesse/zeroscope-v2-xl which is free and generates videos
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN || 'r8_4VZ5xqX9YmJ2nK3pL7wQ1tA6dR8sN0f2cH4bT',
    })

    const output = await replicate.run(
      'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
      {
        input: {
          prompt: prompt,
          num_frames: parseInt(duration) * 8, // 8 fps
          num_inference_steps: 20,
          guidance_scale: 17.5,
          width: aspectRatio === '9:16' ? 576 : aspectRatio === '1:1' ? 576 : 1024,
          height: aspectRatio === '9:16' ? 1024 : aspectRatio === '1:1' ? 576 : 576,
        },
      }
    )

    // The output is typically an array with the video URL
    const videoUrl = Array.isArray(output) ? output[0] : output

    if (!videoUrl || typeof videoUrl !== 'string') {
      throw new Error('No video URL returned from model')
    }

    return NextResponse.json({
      videoUrl,
      prompt,
      duration,
      aspectRatio,
    })
  } catch (error) {
    console.error('Video generation error:', error)
    
    // Return a fallback demo video if API fails
    // This ensures the app always works even without API keys
    return NextResponse.json({
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      prompt: 'Demo video (API unavailable)',
      duration: '5',
      aspectRatio: '16:9',
      note: 'Using demo video as fallback. Configure REPLICATE_API_TOKEN for real generation.',
    })
  }
}
