import React, { useState, useEffect } from 'react';
import { UserProfile, TimelineScenario } from '../types';
import { educationalTips } from '../data/educationalContent';
import { Lightbulb, ChevronRight } from 'lucide-react';

interface EducationalTipProps {
  profile: UserProfile;
  currentScenario: TimelineScenario;
}

export default function EducationalTip({ profile, currentScenario }: EducationalTipProps) {
  const [currentTip, setCurrentTip] = useState(0);

  // Determine relevant tips based on user profile
  const getRelevantTips = () => {
    const savingsRate = (profile.monthlySavings * 12) / profile.income;
    const emergencyFund = profile.currentSavings / (profile.monthlyExpenses * 6);
    
    let relevantTips = [...educationalTips];
    
    // Filter tips based on user's financial situation
    if (savingsRate < 0.1) {
      relevantTips = relevantTips.filter(tip => 
        tip.category === 'saving' || tip.id === 'compound-interest'
      );
    }
    
    if (emergencyFund < 1) {
      relevantTips = relevantTips.filter(tip => 
        tip.id === 'emergency-fund' || tip.category === 'saving'
      );
    }
    
    if (profile.age < 30) {
      relevantTips = relevantTips.filter(tip => 
        tip.id === 'retirement-early' || tip.category === 'investing'
      );
    }
    
    return relevantTips.length > 0 ? relevantTips : educationalTips;
  };

  const relevantTips = getRelevantTips();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % relevantTips.length);
    }, 10000); // Change tip every 10 seconds

    return () => clearInterval(interval);
  }, [relevantTips.length]);

  const tip = relevantTips[currentTip];

  if (!tip) return null;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-400 mb-2">{tip.title}</h4>
            <p className="text-white/80 text-sm leading-relaxed">{tip.content}</p>
          </div>
        </div>
      </div>

      {/* Tip navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {relevantTips.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTip(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTip ? 'bg-yellow-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={() => setCurrentTip((prev) => (prev + 1) % relevantTips.length)}
          className="flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors"
        >
          Next tip
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Contextual advice */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="text-white/60 text-xs mb-1">Based on your profile:</div>
        <div className="text-white text-sm">
          {profile.age < 30 && "You have time on your side - focus on building good habits early."}
          {profile.age >= 30 && profile.age < 50 && "You're in your prime earning years - maximize your savings rate."}
          {profile.age >= 50 && "Pre-retirement planning is crucial - consider reducing risk gradually."}
        </div>
      </div>
    </div>
  );
}