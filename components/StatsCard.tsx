
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
    <div className="glass-card rounded-xl p-5 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 border border-white/5 shadow-inner">
            <i className={`fas ${icon} text-sm`}></i>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
        <div className="text-2xl font-black text-sky-400">{homeValue}{percentage && '%'}</div>
        <div className="text-2xl font-black text-orange-400">{awayValue}{percentage && '%'}</div>
      </div>

      <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-1000 ease-out"
          style={{ width: `${homePercent}%` }}
        ></div>
        <div 
          className="absolute top-0 right-0 h-full bg-gradient-to-l from-orange-600 to-orange-400 transition-all duration-1000 ease-out"
          style={{ width: `${100 - homePercent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatsCard;
