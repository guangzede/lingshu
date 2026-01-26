import React, { useState } from 'react';
import './index.css';

const years = Array.from({ length: 41 }, (_, i) => 1990 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const hours = Array.from({ length: 24 }, (_, i) => i);
const pad2 = (n: number) => n.toString().padStart(2, '0');

const UserInput: React.FC = () => {
  const [selected, setSelected] = useState({
    year: 1990,
    month: 5,
    day: 18,
    hour: 8,
  });
  const [calendar, setCalendar] = useState<'solar' | 'lunar'>('solar');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const getDays = () => {
    const y = selected.year;
    const m = selected.month;
    return new Date(y, m, 0).getDate();
  };
  const daysDynamic = Array.from({ length: getDays() }, (_, i) => i + 1);

  const handleSelect = (
    type: 'year' | 'month' | 'day' | 'hour',
    value: number
  ) => {
    setSelected((prev) => ({ ...prev, [type]: value }));
  };

  const handleToggle = (type: 'calendar' | 'gender', value: any) => {
    if (type === 'calendar') setCalendar(value);
    else setGender(value);
  };

  const handleStart = () => {
    alert('排盘功能开发中');
  };

  const renderColumn = (
    type: 'year' | 'month' | 'day' | 'hour',
    list: number[],
    label: string
  ) => {
    const value = selected[type];
    const display = (v: number) => {
      if (type === 'year') return `${v}年`;
      if (type === 'month') return `${pad2(v)}月`;
      if (type === 'day') return `${pad2(v)}日`;
      if (type === 'hour') return `${pad2(v)}时`;
      return v;
    };
    const idx = list.indexOf(value);
    const visible = list.slice(Math.max(0, idx - 2), idx + 3);
    return (
      <div className="flex flex-col items-center w-1/4 relative">
        <div
          className="flex flex-col items-center justify-center h-64 w-full rounded-xl
            bg-white/10 border border-amber-400 shadow-[0_0_20px_rgba(255,215,0,0.5)]
            backdrop-blur-lg relative overflow-hidden"
        >
          {visible.map((v, i) => (
            <div
              key={v}
              className={`transition-all duration-150 w-full text-center select-none
                ${
                  v === value
                    ? 'text-[1.5rem] font-bold text-amber-300 drop-shadow-[0_0_10px_gold] z-10'
                    : 'text-base text-gray-400 opacity-50'
                }
                ${i === 2 ? 'py-2' : 'py-1'}
              `}
              onClick={() => handleSelect(type, v)}
            >
              {display(v)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-between
        font-sans bg-gradient-to-b from-[#0B0F2A] to-[#1A1F3A] text-amber-300"
    >
      <div className="pt-8 pb-4 text-center w-full">
        <div className="text-3xl font-bold title-text">八字排盘</div>
        <div className="text-lg mt-2 subtitle-text">请输入出生信息</div>
      </div>

      <div className="relative w-full max-w-[420px] px-4 mt-4">
        <div className="flex flex-row justify-between px-2 mb-2">
          {['年', '月', '日', '时'].map((label) => (
            <div
              key={label}
              className="w-1/4 text-center text-amber-300 text-lg font-semibold label-text"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="flex flex-row items-center justify-between w-full relative">
          {renderColumn('year', years, '年')}
          {renderColumn('month', months, '月')}
          {renderColumn('day', daysDynamic, '日')}
          {renderColumn('hour', hours, '时')}
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 pointer-events-none
              flex items-center"
          >
            <div className="w-full h-full rounded-xl border-2 border-amber-300 shadow-[0_0_20px_2px_rgba(255,215,0,0.3)]" />
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-center gap-6 mt-8 w-full max-w-[420px]">
        <div className="flex rounded-full border-2 border-amber-300 overflow-hidden">
          <button
            className={`px-8 py-2 text-lg font-semibold transition-all ${
              calendar === 'solar'
                ? 'bg-gradient-to-r from-amber-300 to-yellow-200 text-gray-900 shadow-[0_0_10px_#FFD700]'
                : 'bg-transparent text-amber-300'
            }`}
            onClick={() => handleToggle('calendar', 'solar')}
          >
            公历
          </button>
          <button
            className={`px-8 py-2 text-lg font-semibold transition-all ${
              calendar === 'lunar'
                ? 'bg-gradient-to-r from-amber-300 to-yellow-200 text-gray-900 shadow-[0_0_10px_#FFD700]'
                : 'bg-transparent text-amber-300'
            }`}
            onClick={() => handleToggle('calendar', 'lunar')}
          >
            农历
          </button>
        </div>
        <div className="flex rounded-full border-2 border-amber-300 overflow-hidden">
          <button
            className={`px-8 py-2 text-lg font-semibold transition-all ${
              gender === 'male'
                ? 'bg-gradient-to-r from-amber-300 to-yellow-200 text-gray-900 shadow-[0_0_10px_#FFD700]'
                : 'bg-transparent text-amber-300'
            }`}
            onClick={() => handleToggle('gender', 'male')}
          >
            男
          </button>
          <button
            className={`px-8 py-2 text-lg font-semibold transition-all ${
              gender === 'female'
                ? 'bg-gradient-to-r from-amber-300 to-yellow-200 text-gray-900 shadow-[0_0_10px_#FFD700]'
                : 'bg-transparent text-amber-300'
            }`}
            onClick={() => handleToggle('gender', 'female')}
          >
            女
          </button>
        </div>
      </div>

      <div className="w-full flex justify-center mt-10 mb-10">
        <button
          className="w-[90vw] max-w-[420px] py-4 rounded-full border-2 border-amber-300
            bg-gradient-to-b from-amber-200/10 to-transparent text-amber-300 text-xl font-bold
            shadow-[0_0_30px_5px_#FFD70099] transition-all
            hover:bg-amber-300/20 hover:text-yellow-900"
          onClick={handleStart}
        >
          开始排盘
        </button>
      </div>
    </div>
  );
};

export default UserInput;
