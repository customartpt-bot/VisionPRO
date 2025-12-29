
import React from 'react';

interface StatsCardProps {
  label: string;
  homeValue: string | number;
  awayValue: string | number;
  icon: string;
  percentage?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, homeValue, awayValue, icon, percentage }) => {
  const homeNum = typeof homeValue === 'number' ? homeValue : parseFloat(homeValue.toString());
  const awayNum = typeof awayValue === 'number' ? awayValue : parseFloat(awayValue.toString());
  const total = homeNum + awayNum;
  const homePercent = total === 0 ? 50 : (homeNum / total) * 100;

  return (
    <div className="glass-card rounded-xl p-5 hover:border-orange-500/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-slate-500 border border-white/5 shadow-inner">
            <i className={`fas ${icon} text-sm`}></i>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
        <div className="text-2xl font-black text-white">{homeValue}{percentage && '%'}</div>
        <div className="text-2xl font-black text-orange-500">{awayValue}{percentage && '%'}</div>
      </div>

      <div className="relative h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
        <div 
          className="absolute top-0 left-0 h-full bg-slate-200 transition-all duration-1000 ease-out"
          style={{ width: `${homePercent}%` }}
        ></div>
        <div 
          className="absolute top-0 right-0 h-full bg-orange-600 transition-all duration-1000 ease-out"
          style={{ width: `${100 - homePercent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatsCard;
