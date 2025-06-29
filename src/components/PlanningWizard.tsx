import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { formatCurrency, calculateTimeline, scenarios } from '../utils/financialCalculations';
import { 
  X, 
  Play, 
  ArrowRight, 
  User, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Star, 
  Home, 
  Briefcase, 
  GraduationCap, 
  Plane, 
  Building, 
  Heart,
  CheckCircle,
  XCircle,
  Sparkles,
  Zap,
  Clock,
  Shield,
  Trophy,
  Rocket
} from 'lucide-react';

interface StorySlide {
  id: string;
  title: string;
  narration: string;
  icon: React.ComponentType<any>;
  color: string;
  animation?: 'bounce' | 'pulse' | 'spin' | 'shake';
  soundEffect?: 'success' | 'warning' | 'neutral';
}

interface PlanningWizardProps {
  profile: UserProfile;
  onClose: () => void;
  onStartPlan?: () => void;
}

export default function PlanningWizard({ profile, onClose, onStartPlan }: PlanningWizardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slides, setSlides] = useState<StorySlide[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    generatePersonalizedStory();
  }, [profile]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPlay && isPlaying && currentSlide < slides.length - 1) {
      interval = setTimeout(() => {
        nextSlide();
      }, 4000); // 4 seconds per slide in auto mode
    }
    return () => clearTimeout(interval);
  }, [autoPlay, isPlaying, currentSlide, slides.length]);

  const generatePersonalizedStory = () => {
    const userName = 'You'; // Could be personalized with actual user name
    const currentYear = new Date().getFullYear();
    const savingsRate = (profile.monthlySavings * 12) / profile.income;
    const emergencyMonths = profile.currentSavings / profile.monthlyExpenses;
    
    // Calculate timelines for different scenarios
    const currentPath = calculateTimeline(profile, scenarios[0], 30);
    const improvedPath = calculateTimeline(profile, scenarios[1], 30);
    const expertPath = calculateTimeline(profile, scenarios[2], 30);

    const storySlides: StorySlide[] = [
      // Step 1: Introduction
      {
        id: 'intro',
        title: `Meet ${userName}`,
        narration: `Meet ${userName}. You're ${profile.age} years old and earning ${formatCurrency(profile.income)} annually. You have dreams and goals, but like many people, you're trying to figure out how to turn those dreams into reality through smart financial planning.`,
        icon: User,
        color: 'from-blue-500 to-purple-500',
        animation: 'bounce'
      },

      // Step 2: Current Financial Habits
      {
        id: 'current-habits',
        title: 'Your Current Financial Habits',
        narration: `Right now, you're saving ${formatCurrency(profile.monthlySavings)} every month - that's ${(savingsRate * 100).toFixed(1)}% of your income. ${
          savingsRate < 0.1 ? "You know you could be saving more, but life has its expenses." :
          savingsRate < 0.2 ? "You're doing okay with savings, but there's room for improvement." :
          "You're actually doing quite well with your savings rate!"
        } Your current savings total ${formatCurrency(profile.currentSavings)}.`,
        icon: TrendingUp,
        color: savingsRate >= 0.2 ? 'from-green-500 to-emerald-500' : savingsRate >= 0.1 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500',
        animation: savingsRate >= 0.2 ? 'bounce' : 'pulse'
      },

      // Step 3: Your Dreams and Goals
      {
        id: 'dreams',
        title: 'Your Financial Dreams',
        narration: profile.goals.length > 0 
          ? `You have ${profile.goals.length} major financial goal${profile.goals.length > 1 ? 's' : ''}: ${profile.goals.map(g => `${g.name} (${formatCurrency(g.targetAmount)} by ${g.targetYear})`).join(', ')}. ${
              profile.goals.length === 1 ? "It's a great start!" : 
              profile.goals.length <= 3 ? "These are solid, achievable goals!" : 
              "Wow, you're really ambitious - and that's fantastic!"
            }`
          : `You haven't set specific financial goals yet, but that's okay! Everyone starts somewhere. Maybe you're thinking about buying a home, starting a business, or planning for retirement. Let's explore what's possible.`,
        icon: profile.goals.length > 0 ? Target : Star,
        color: 'from-purple-500 to-pink-500',
        animation: 'pulse'
      },

      // Step 4: Timeline A - Current Path
      {
        id: 'timeline-current',
        title: 'Timeline A – Your Current Path',
        narration: `Let's see what happens if you continue with your current financial habits... In 10 years, you'll have ${formatCurrency(currentPath[10]?.netWorth || 0)}. ${
          currentPath[10]?.netWorth > 500000 ? "That's actually not bad!" :
          currentPath[10]?.netWorth > 200000 ? "It's a decent start, but you could do better." :
          "Unfortunately, this path might not get you to your dreams as quickly as you'd like."
        } ${
          profile.goals.length > 0 ? 
            `Looking at your goals, ${profile.goals.filter(g => (currentPath.find(p => p.age >= profile.age + (g.targetYear - currentYear))?.netWorth || 0) >= g.targetAmount).length} out of ${profile.goals.length} would be achievable on this path.` :
            "Without specific goals, it's hard to measure progress, but the growth is steady."
        }`,
        icon: TrendingDown,
        color: 'from-red-500 to-orange-500',
        animation: 'shake',
        soundEffect: 'warning'
      },

      // Step 5: Timeline B - Improved Path
      {
        id: 'timeline-improved',
        title: 'Timeline B – The Improved Path',
        narration: `Now imagine you make some smart improvements - maybe save ${formatCurrency(profile.monthlySavings * 1.5)} per month and learn better budgeting. In 10 years, you'd have ${formatCurrency(improvedPath[10]?.netWorth || 0)}. ${
          (improvedPath[10]?.netWorth || 0) > (currentPath[10]?.netWorth || 0) * 1.5 ? "That's a significant improvement!" : "Every little bit helps!"
        } ${
          profile.goals.length > 0 ? 
            `With this approach, ${profile.goals.filter(g => (improvedPath.find(p => p.age >= profile.age + (g.targetYear - currentYear))?.netWorth || 0) >= g.targetAmount).length} of your ${profile.goals.length} goals become much more achievable.` :
            "This path opens up many more possibilities for your future."
        }`,
        icon: TrendingUp,
        color: 'from-yellow-500 to-orange-500',
        animation: 'pulse'
      },

      // Step 6: Timeline C - Expert Path
      {
        id: 'timeline-expert',
        title: 'Timeline C – The Expert Path',
        narration: `Here's the exciting part: following expert financial advice with smart investing, emergency planning, and saving ${formatCurrency(profile.monthlySavings * 2)} monthly. Your wealth grows with compound interest magic! In 10 years: ${formatCurrency(expertPath[10]?.netWorth || 0)}. In 20 years: ${formatCurrency(expertPath[20]?.netWorth || 0)}. ${
          (expertPath[20]?.netWorth || 0) > 1000000 ? "You could be a millionaire!" : "You'd be well on your way to financial freedom!"
        } ${
          profile.goals.length > 0 ? 
            `On this path, ${profile.goals.filter(g => (expertPath.find(p => p.age >= profile.age + (g.targetYear - currentYear))?.netWorth || 0) >= g.targetAmount).length} out of ${profile.goals.length} goals are not just achievable - they might happen ahead of schedule!` :
            "This path could make almost any financial dream possible."
        }`,
        icon: Rocket,
        color: 'from-green-500 to-blue-500',
        animation: 'bounce',
        soundEffect: 'success'
      },

      // Step 7: Disaster Preparedness
      {
        id: 'disaster-mode',
        title: 'Life\'s Unexpected Challenges',
        narration: `But life isn't always smooth sailing. What if you face a job loss, medical emergency, or market crash? ${
          emergencyMonths >= 6 ? 
            `Good news! With ${emergencyMonths.toFixed(1)} months of expenses saved, you're well-prepared for emergencies.` :
          emergencyMonths >= 3 ? 
            `You have ${emergencyMonths.toFixed(1)} months of emergency savings - that's a good start, but building it to 6 months would give you even more security.` :
            `With only ${emergencyMonths.toFixed(1)} months of emergency savings, unexpected events could derail your progress. But don't worry - we can fix this!`
        } The expert path includes building a solid emergency fund and insurance protection, so you can weather any storm and bounce back stronger.`,
        icon: emergencyMonths >= 6 ? Shield : AlertTriangle,
        color: emergencyMonths >= 6 ? 'from-green-500 to-teal-500' : 'from-orange-500 to-red-500',
        animation: emergencyMonths >= 6 ? 'pulse' : 'shake',
        soundEffect: emergencyMonths >= 6 ? 'success' : 'warning'
      },

      // Step 8: Key Lessons
      {
        id: 'lessons',
        title: 'The Power of Small Changes',
        narration: `Your financial journey shows how every choice compounds over time. The difference between the current path and expert path? ${formatCurrency((expertPath[20]?.netWorth || 0) - (currentPath[20]?.netWorth || 0))} over 20 years! That's the power of: starting early, staying consistent, making smart investment choices, and having a plan. You don't need to be a finance expert - just start small, stay committed, and let Fincyq guide your way.`,
        icon: Sparkles,
        color: 'from-purple-500 to-blue-500',
        animation: 'pulse'
      },

      // Step 9: Your Next Steps
      {
        id: 'next-steps',
        title: 'Your Financial Adventure Begins',
        narration: `Now it's your turn to choose your path. Will you stick with the current approach, make some improvements, or go all-in with the expert strategy? Remember: ${
          profile.age < 30 ? "You have time on your side - the earlier you start, the more compound interest works its magic!" :
          profile.age < 50 ? "You're in your prime earning years - this is the perfect time to accelerate your wealth building!" :
          "It's never too late to optimize your financial future - every year of smart planning makes a difference!"
        } Your future self will thank you for the decisions you make today.`,
        icon: Trophy,
        color: 'from-yellow-500 to-orange-500',
        animation: 'bounce'
      }
    ];

    setSlides(storySlides);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
      
      // Trigger sound effects and animations
      const slide = slides[currentSlide + 1];
      if (slide?.soundEffect === 'success') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    setIsPlaying(!autoPlay);
  };

  const handleStartPlan = () => {
    setShowConfetti(true);
    setTimeout(() => {
      onStartPlan?.();
      onClose();
    }, 1500);
  };

  const currentSlideData = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  if (!currentSlideData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-60">
          {[...Array(50)].map((_, i) => (
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
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col border border-white/20 overflow-hidden">
        {/* Header with Progress */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Play size={20} className="text-white" />
                </div>
                Your Financial Story
              </h2>
              <p className="text-white/60 mt-1">Discover how your choices shape your financial future</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAutoPlay}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  autoPlay 
                    ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                    : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                }`}
              >
                {autoPlay ? <Zap size={16} /> : <Play size={16} />}
                {autoPlay ? 'Auto' : 'Manual'}
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white/60 text-sm">
              <span>Step {currentSlide + 1} of {slides.length}</span>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Story Icon */}
            <div className={`w-24 h-24 bg-gradient-to-br ${currentSlideData.color} rounded-full flex items-center justify-center mx-auto mb-8 ${
              currentSlideData.animation === 'bounce' ? 'animate-bounce' :
              currentSlideData.animation === 'pulse' ? 'animate-pulse' :
              currentSlideData.animation === 'spin' ? 'animate-spin' :
              currentSlideData.animation === 'shake' ? 'animate-pulse' : ''
            } shadow-2xl`}>
              <currentSlideData.icon size={40} className="text-white" />
            </div>

            {/* Story Title */}
            <h3 className="text-3xl font-bold text-white mb-6">
              {currentSlideData.title}
            </h3>

            {/* Story Narration */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-8">
              <p className="text-white/90 text-lg leading-relaxed">
                {currentSlideData.narration}
              </p>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-purple-400 scale-125' 
                      : index < currentSlide 
                        ? 'bg-green-400' 
                        : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex justify-between items-center">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors flex items-center gap-2"
            >
              <ArrowRight size={16} className="rotate-180" />
              Previous
            </button>

            <div className="flex items-center gap-4">
              {/* Quick Jump Buttons */}
              <div className="hidden md:flex gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                      index === currentSlide 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {currentSlide === slides.length - 1 ? (
              <button
                onClick={handleStartPlan}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-xl text-white font-bold transition-all flex items-center gap-2 shadow-xl hover:shadow-green-500/25 transform hover:scale-105"
              >
                <Rocket size={20} />
                Start My Financial Plan
              </button>
            ) : (
              <button
                onClick={nextSlide}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
              >
                Next
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}