import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getLocalDateString, calculateDailySoll, calculateMinutes, calculateAllTimeAppDiff } from '../../utils/timeCalculations';

export default function KalenderView({ goToHeute }) {
    const { appData, updateAppData } = useApp();
    const [viewDate, setViewDate] = useState(new Date());

    const changeMonth = (dir) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + dir);
        setViewDate(newDate);
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });

    // useMemo verhindert, dass der Kalender bei jedem Tastendruck im Input-Feld neu berechnet wird
    const calendarData = useMemo(() => {
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 7 : firstDay; 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const cells = [];
        let monthDiff = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i < firstDay; i++) {
            cells.push({ type: 'empty', id: `empty-${i}` });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            const dateObj = new Date(dStr);
            const dayOfWeek = dateObj.getDay();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            
            const entry = appData.entries[dStr];
            const holiday = appData.holidays[dStr];
            
            const daySoll = entry && entry.soll !== undefined ? entry.soll : calculateDailySoll(dStr, appData.settings, appData.holidays);
            let netStd = 0;
            
            if (entry && entry.begin && entry.end) {
                const bMin = calculateMinutes(entry.begin, entry.end);
                netStd = Math.max(0, (bMin - (parseFloat(entry.pause) || 0)) / 60);
            }
            
            let dayDiff = netStd - daySoll;
            const isFuture = dateObj > today;
            
            if (!entry && isFuture) dayDiff = 0;
            else if (!entry && !isFuture && daySoll > 0) dayDiff = -daySoll;
            
            monthDiff += dayDiff;
            
            cells.push({ type: 'day', id: dStr, dayStr: dStr, dayNum: i, isWeekend, holiday, entry, netStd, dayDiff });
        }

        const totalRendered = cells.length;
        for(let i = 0; i < 42 - totalRendered; i++) {
             cells.push({ type: 'empty', id: `empty-end-${i}` });
        }

        const allTimeDiff = calculateAllTimeAppDiff(appData.entries, appData.settings, appData.holidays, year, month);

        return { cells, monthDiff, allTimeDiff };
    }, [year, month, appData]);

    const { cells, monthDiff, allTimeDiff } = calendarData;
    const agSaldo = parseFloat(appData.settings.agSaldo || 0);
    const totalAG = agSaldo + monthDiff;

    const percent = appData.settings.model.percentage || 100;
    const effWeekly = appData.settings.model.hours * (percent / 100);
    const hrMonthlySoll = effWeekly * 13 / 3;

    const handleAgSaldoChange = (e) => {
        const val = parseFloat(e.target.value) || 0;
        updateAppData(prev => ({
            ...prev,
            settings: { ...prev.settings, agSaldo: val }
        }));
    };

    return (
        <div className="flex flex-col h-full gap-2">
            
            <div className="flex justify-between items-center bg-blue-600 text-white p-2 rounded-xl shadow-sm shrink-0">
                <button onClick={() => changeMonth(-1)} className="p-2 bg-blue-500 rounded-lg active:bg-blue-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <div className="text-base font-bold">{monthName}</div>
                <button onClick={() => changeMonth(1)} className="p-2 bg-blue-500 rounded-lg active:bg-blue-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm flex-1 flex flex-col min-h-0 border border-slate-100">
                <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[10px] font-bold text-slate-400 uppercase shrink-0">
                    <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
                </div>
                <div className="grid grid-cols-7 gap-1 grid-rows-6 flex-1 min-h-0">
                    {cells.map(cell => {
                        if (cell.type === 'empty') return <div key={cell.id} className="bg-transparent"></div>;

                        let bgClass = cell.isWeekend ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100";
                        let holidayHtml = null;

                        if (cell.holiday) {
                            const shortName = cell.holiday.name.replace(" (regional)", "").replace(" (Feiertag)", "");
                            if (cell.holiday.isSchool) {
                                holidayHtml = <div className="text-[6.5px] leading-none font-bold text-green-600 w-full text-center truncate px-0.5 mt-0.5" title={cell.holiday.name}>{shortName}</div>;
                            } else {
                                bgClass = "bg-yellow-50 border-yellow-200";
                                holidayHtml = <div className="text-[6.5px] leading-none font-bold text-yellow-600 w-full text-center truncate px-0.5 mt-0.5" title={cell.holiday.name}>{shortName}</div>;
                            }
                        }

                        const hasEntry = cell.entry && cell.entry.begin && cell.entry.end;
                        const diffColor = cell.dayDiff >= 0 ? 'text-emerald-500' : 'text-red-500';
                        
                        return (
                            <div 
                                key={cell.id}
                                onClick={() => goToHeute(cell.dayStr)}
                                className={`cal-cell p-1 justify-start relative border rounded-lg shadow-sm ${bgClass} cursor-pointer active:scale-95 transition-transform overflow-hidden`}
                            >
                                <div className={`text-xs font-bold text-center ${cell.isWeekend ? 'text-slate-400' : 'text-slate-800'}`}>
                                    {cell.dayNum}
                                </div>
                                {holidayHtml}
                                
                                <div className="mt-auto flex flex-col items-center justify-center w-full">
                                    {hasEntry && (
                                        <>
                                            <div className="text-[9px] text-slate-500 mt-0.5 leading-tight text-center">
                                                {cell.entry.begin}<br/>{cell.entry.end}
                                            </div>
                                            <div className={`text-[11px] font-black ${diffColor} mt-0.5 text-center`}>
                                                {cell.netStd.toFixed(1)}h
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                {cell.entry && cell.entry.remark && (
                                    <div className="absolute bottom-1 right-1 text-[10px] opacity-70">💬</div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-2 flex justify-center gap-3 text-[9px] text-slate-500 font-medium shrink-0">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-300 rounded-full"></div> Feiertag</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-300 rounded-full"></div> Ferien</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-200 rounded-full"></div> Wochenende</span>
                </div>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm space-y-2 border border-blue-100 shrink-0">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-1 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wide pointer-events-none">Übertrag (AG)</div>
                        <input type="number" step="0.01" value={agSaldo || ''} onChange={handleAgSaldoChange} className="w-full text-sm font-bold bg-transparent text-center outline-none text-slate-700 p-0 m-0" />
                    </div>
                    
                    <div className="p-1 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Monats-Differenz</div>
                        <div className={`text-sm font-bold ${monthDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {monthDiff > 0 ? '+' : ''}{monthDiff.toFixed(2)} h
                        </div>
                    </div>

                    <div className="p-1 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">HR Soll (Monat)</div>
                        <div className="text-sm font-bold text-slate-700">{hrMonthlySoll.toFixed(1)} h</div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2">
                    <div className="bg-blue-50 py-2 px-3 rounded-xl flex justify-between items-center shadow-sm border border-blue-100">
                        <div className="text-xs font-bold text-blue-900 tracking-wide">1. Saldo (inkl. AG-Übertrag)</div>
                        <div className={`text-xl font-black tracking-tight ${totalAG >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {totalAG > 0 ? '+' : ''}{totalAG.toFixed(2)} h
                        </div>
                    </div>
                    <div className="bg-indigo-50 py-2 px-3 rounded-xl flex justify-between items-center shadow-sm border border-indigo-100">
                        <div className="text-xs font-bold text-indigo-900 tracking-wide">2. App-Gesamtsaldo (Automatisch)</div>
                        <div className={`text-xl font-black tracking-tight ${allTimeDiff >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                            {allTimeDiff > 0 ? '+' : ''}{allTimeDiff.toFixed(2)} h
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}