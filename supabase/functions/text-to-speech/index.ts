const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TextToSpeechRequest {
  text: string;
  voiceId?: string;
  options?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the request is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get ElevenLabs API key from environment
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      console.error('ELEVENLABS_API_KEY environment variable not set')
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const requestBody = await req.json()
    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB', options = {} }: TextToSpeechRequest = requestBody

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Clean text for better speech synthesis
    const cleanedText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/₹/g, 'rupees ')
      .replace(/\$/g, 'dollars ')
      .replace(/\. /g, '. ... ')
      .replace(/! /g, '! ... ')
      .replace(/\? /g, '? ... ')
      .replace(/(\d+)%/g, '$1 percent')
      .replace(/(\d+),(\d+)/g, '$1 thousand $2')
      .replace(/\s+/g, ' ')
      .trim()

    console.log(`Generating speech for text: "${cleanedText.substring(0, 100)}..."`)
    console.log(`Using voice ID: ${voiceId}`)

    // Call ElevenLabs API with proper error handling
    let elevenLabsResponse: Response
    
    try {
      elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey
          },
          body: JSON.stringify({
            text: cleanedText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: options.stability || 0.5,
              similarity_boost: options.similarityBoost || 0.75,
              style: options.style || 0.0,
              use_speaker_boost: options.useSpeakerBoost || true
            }
          })
        }
      )
    } catch (fetchError) {
      console.error('Failed to fetch from ElevenLabs API:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to connect to audio service' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text()
      console.error(`ElevenLabs API error: ${elevenLabsResponse.status} - ${errorText}`)
      
      // Return user-friendly error messages
      let userMessage = 'Audio generation failed'
      if (elevenLabsResponse.status === 429) {
        userMessage = 'Audio service is busy. Please try again in a moment.'
      } else if (elevenLabsResponse.status === 401) {
        userMessage = 'Audio service authentication failed. Please contact support.'
      } else if (elevenLabsResponse.status === 402) {
        userMessage = 'Audio service quota exceeded. Please try again later.'
      } else if (elevenLabsResponse.status === 422) {
        userMessage = 'Invalid text provided for audio generation.'
      }
      
      return new Response(
        JSON.stringify({ error: userMessage }),
        { 
          status: elevenLabsResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the audio data
    const audioArrayBuffer = await elevenLabsResponse.arrayBuffer()
    console.log(`Generated audio of size: ${audioArrayBuffer.byteLength} bytes`)
    
    // Return the audio data
    return new Response(audioArrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioArrayBuffer.byteLength.toString(),
      }
    })

  } catch (error) {
    console.error('Text-to-speech function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})