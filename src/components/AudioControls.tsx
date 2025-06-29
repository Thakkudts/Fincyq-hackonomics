import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Loader2,
  AlertCircle,
  Settings,
  Mic
} from 'lucide-react';
import { AudioState } from '../hooks/useAudioNarration';

interface AudioControlsProps {
  audioState: AudioState;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  isConfigured: boolean;
  className?: string;
}

export default function AudioControls({
  audioState,
  onPlay,
  onPause,
  onReplay,
  onSeek,
  onVolumeChange,
  isConfigured,
  className = ''
}: AudioControlsProps) {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    onVolumeChange(newVolume);
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(volume > 0 ? volume : 0.5);
    } else {
      handleVolumeChange(0);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = audioState.duration > 0 
    ? (audioState.currentTime / audioState.duration) * 100 
    : 0;

  if (!isConfigured) {
    return (
      <div className={`bg-orange-500/20 border border-orange-400/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-orange-400 font-medium text-sm">Voice Narration Unavailable</div>
            <div className="text-orange-300 text-xs mt-1">
              Add VITE_ELEVENLABS_API_KEY to your .env file to enable AI voice narration
            </div>
          </div>
          <div className="flex items-center gap-1 text-orange-400">
            <Settings size={16} />
            <span className="text-xs">Setup Required</span>
          </div>
        </div>
      </div>
    );
  }

  if (audioState.error) {
    return (
      <div className={`bg-red-500/20 border border-red-400/30 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-red-400 font-medium text-sm">Audio Error</div>
            <div className="text-red-300 text-xs mt-1">{audioState.error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Voice Indicator */}
        <div className="flex items-center gap-2 text-blue-400">
          <Mic size={16} />
          <span className="text-xs font-medium">AI Voice</span>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={audioState.isPlaying ? onPause : onPlay}
            disabled={audioState.isLoading || !audioState.hasAudio}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              audioState.isLoading
                ? 'bg-gray-500/50 cursor-not-allowed'
                : audioState.hasAudio
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-blue-500/25'
                  : 'bg-gray-500/50 cursor-not-allowed'
            }`}
          >
            {audioState.isLoading ? (
              <Loader2 size={16} className="text-white animate-spin" />
            ) : audioState.isPlaying ? (
              <Pause size={16} className="text-white" />
            ) : (
              <Play size={16} className="text-white ml-0.5" />
            )}
          </button>

          {/* Replay Button */}
          <button
            onClick={onReplay}
            disabled={!audioState.hasAudio}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            title="Replay"
          >
            <RotateCcw size={14} className="text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        {audioState.hasAudio && (
          <div className="flex-1 flex items-center gap-3">
            <span className="text-white/60 text-xs font-mono">
              {formatTime(audioState.currentTime)}
            </span>
            
            <div className="flex-1 relative">
              <div className="w-full bg-white/20 rounded-full h-2 cursor-pointer"
                   onClick={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const x = e.clientX - rect.left;
                     const percentage = x / rect.width;
                     onSeek(percentage * audioState.duration);
                   }}>
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                </div>
              </div>
            </div>
            
            <span className="text-white/60 text-xs font-mono">
              {formatTime(audioState.duration)}
            </span>
          </div>
        )}

        {/* Volume Controls */}
        <div className="relative">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            onMouseEnter={() => setShowVolumeSlider(true)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={14} className="text-white" />
            ) : (
              <Volume2 size={14} className="text-white" />
            )}
          </button>

          {/* Volume Slider */}
          {showVolumeSlider && (
            <div 
              className="absolute bottom-full right-0 mb-2 bg-white/10 backdrop-blur-lg rounded-lg p-3 border border-white/20"
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <div className="flex flex-col items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  style={{ writingMode: 'bt-lr' }}
                />
                <button
                  onClick={toggleMute}
                  className="text-white/60 hover:text-white text-xs transition-colors"
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {audioState.isLoading && (
          <div className="flex items-center gap-2 text-blue-400">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">Generating voice...</span>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {!audioState.hasAudio && !audioState.isLoading && !audioState.error && (
        <div className="mt-3 text-center">
          <div className="text-white/60 text-xs">
            Click the play button to generate AI narration for this slide
          </div>
        </div>
      )}
    </div>
  );
}