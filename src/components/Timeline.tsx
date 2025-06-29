import React, { useState } from 'react';
import { UserProfile } from '../types';
import { formatCurrency } from '../utils/financialCalculations';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface TimelineProps {
  data: Array<{
    scenario: string;
    data: any[];
    color: string;
  }>;
  selectedScenario: number;
  profile: UserProfile;
}

export default function Timeline({ data, selectedScenario, profile }: TimelineProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(10);

  const maxNetWorth = Math.max(...data.flatMap(d => d.data.map(point => point.netWorth)));
  const years = data[0]?.data || [];
  const currentData = data[selectedScenario]?.data || [];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <TrendingUp className="text-green-400" />
          Financial Timeline
        </h2>
        
        <div className="flex items-center gap-2 text-white/60">
          <Calendar size={16} />
          <span>Next {years.length} years</span>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-white/60 text-sm mb-2">
          <span>Year {new Date().getFullYear()}</span>
          <span>Year {new Date().getFullYear() + years.length}</span>
        </div>
        
        <input
          type="range"
          min="0"
          max={years.length - 1}
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
        />
        
        <div className="text-center mt-2">
          <span className="text-white font-medium">
            {years[selectedYear]?.year} (Age {years[selectedYear]?.age})
          </span>
        </div>
      </div>

      {/* Selected Year Details */}
      {currentData[selectedYear] && (
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-white/60 text-sm">Net Worth</div>
              <div className="text-lg font-bold text-green-400">
                {formatCurrency(currentData[selectedYear].netWorth)}
              </div>
            </div>
            
            <div>
              <div className="text-white/60 text-sm">Investments</div>
              <div className="text-lg font-bold text-blue-400">
                {formatCurrency(currentData[selectedYear].investmentValue)}
              </div>
            </div>
            
            <div>
              <div className="text-white/60 text-sm">Liquid Savings</div>
              <div className="text-lg font-bold text-purple-400">
                {formatCurrency(currentData[selectedYear].totalSavings)}
              </div>
            </div>
            
            <div>
              <div className="text-white/60 text-sm">Goals Achieved</div>
              <div className="text-lg font-bold text-yellow-400">
                {currentData[selectedYear].goalsAchieved.length}
              </div>
            </div>
          </div>
          
          {currentData[selectedYear].events.length > 0 && (
            <div className="mt-4">
              <div className="text-white/60 text-sm mb-2">Life Events</div>
              <div className="space-y-1">
                {currentData[selectedYear].events.map((event, index) => (
                  <div key={index} className="text-white/80 text-sm bg-white/5 rounded px-2 py-1">
                    {event}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="relative h-64 bg-white/5 rounded-xl p-4">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={`${ratio * 100}%`}
              x2="100%"
              y2={`${ratio * 100}%`}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          
          {/* Timeline paths */}
          {data.map((timeline, index) => {
            const points = timeline.data.map((point, i) => {
              const x = (i / (timeline.data.length - 1)) * 100;
              const y = 100 - (point.netWorth / maxNetWorth) * 100;
              return `${x},${y}`;
            }).join(' ');
            
            return (
              <polyline
                key={timeline.scenario}
                points={points}
                fill="none"
                stroke={timeline.color}
                strokeWidth={index === selectedScenario ? "3" : "2"}
                opacity={index === selectedScenario ? 1 : 0.6}
                className="transition-all duration-300"
              />
            );
          })}
          
          {/* Selected year indicator */}
          <line
            x1={`${(selectedYear / (years.length - 1)) * 100}%`}
            y1="0"
            x2={`${(selectedYear / (years.length - 1)) * 100}%`}
            y2="100%"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-white/60 text-xs">
          <span>{formatCurrency(maxNetWorth)}</span>
          <span>{formatCurrency(maxNetWorth * 0.75)}</span>
          <span>{formatCurrency(maxNetWorth * 0.5)}</span>
          <span>{formatCurrency(maxNetWorth * 0.25)}</span>
          <span>$0</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {data.map((timeline, index) => (
          <div key={timeline.scenario} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: timeline.color }}
            />
            <span className={`text-sm ${index === selectedScenario ? 'text-white font-medium' : 'text-white/60'}`}>
              {timeline.scenario}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}