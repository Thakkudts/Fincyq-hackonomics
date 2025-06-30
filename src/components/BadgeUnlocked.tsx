import React, { useEffect, useState } from 'react';
import { Badge } from '../types';
import { rarityColors } from '../data/badges';
import { Trophy, Star, Sparkles, X } from 'lucide-react';

interface BadgeUnlockedProps {
  badge: Badge;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function BadgeUnlocked({ 
  badge, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 5000 
}: BadgeUnlockedProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close if enabled
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Badge Unlock Modal */}
      <div 
        className={`relative bg-gradient-to-br ${rarityColors[badge.rarity]} p-8 rounded-3xl border border-white/30 shadow-2xl max-w-md w-full transform transition-all duration-500 ${
          isVisible && !isClosing 
            ? 'scale-100 opacity-100 rotate-0' 
            : 'scale-75 opacity-0 rotate-12'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Celebration Effects */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* Sparkles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              <Sparkles size={12} className="text-yellow-300" />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trophy size={32} className="text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              🎉 Badge Unlocked!
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-300">
              <Star size={16} className="fill-current" />
              <span className="text-sm font-medium uppercase tracking-wide">
                {badge.rarity} Achievement
              </span>
              <Star size={16} className="fill-current" />
            </div>
          </div>

          {/* Badge Display */}
          <div className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/20">
            <div className="text-6xl mb-4 animate-pulse">
              {badge.emoji}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {badge.name}
            </h3>
            <p className="text-white/80 text-sm">
              {badge.description}
            </p>
          </div>

          {/* Motivational Message */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/90 text-sm leading-relaxed">
              {getMotivationalMessage(badge)}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="mt-6 w-full px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trophy size={16} />
            Continue Your Journey
          </button>
        </div>
      </div>
    </div>
  );
}

function getMotivationalMessage(badge: Badge): string {
  const messages = {
    'money-magnet': "You're building wealth one rupee at a time! Keep up the excellent saving habits.",
    'crisis-crusher': "You've proven you can weather any financial storm. Your emergency planning is top-notch!",
    'risk-ready': "Knowledge is power! You now understand your risk profile and can make informed decisions.",
    'planner-pro': "Goal setting is the first step to financial success. You're on the right track!",
    'emergency-ace': "Your emergency fund is your financial safety net. You're prepared for anything!",
    'insurance-insider': "Protection is key to preserving wealth. You're thinking like a true financial planner.",
    'dream-builder': "Dreams without plans are just wishes. You're turning dreams into achievable goals!",
    'timeline-explorer': "Understanding different scenarios helps you make better decisions. Great exploration!",
    'expense-tracker': "Tracking expenses is the foundation of financial awareness. You're building great habits!",
    'ai-advisor': "Learning never stops! You're leveraging technology to improve your financial knowledge.",
    'millionaire-mindset': "You've reached a major milestone! Your dedication to saving is truly impressive.",
    'financial-guru': "You've mastered the fundamentals of personal finance. You're an inspiration to others!"
  };

  return messages[badge.id as keyof typeof messages] || "Congratulations on this achievement! You're making great progress on your financial journey.";
}