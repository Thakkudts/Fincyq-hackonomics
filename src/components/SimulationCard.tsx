import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SimulationCardProps {
  title: string;
  value: string;
  target: string;
  progress: number;
  color: string;
}

export default function SimulationCard({ title, value, target, progress, color }: SimulationCardProps) {
  const isOnTrack = progress >= 80;
  const needsImprovement = progress < 50;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium text-sm">{title}</h4>
        {isOnTrack ? (
          <TrendingUp size={16} className="text-green-400" />
        ) : (
          <TrendingDown size={16} className="text-red-400" />
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-white/60 text-sm">Target: {target}</div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${color}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs">
            <span className={`${
              isOnTrack 
                ? 'text-green-400' 
                : needsImprovement 
                  ? 'text-red-400' 
                  : 'text-yellow-400'
            }`}>
              {progress.toFixed(1)}%
            </span>
            <span className="text-white/60">
              {isOnTrack 
                ? 'On track!' 
                : needsImprovement 
                  ? 'Needs work' 
                  : 'Getting there'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}