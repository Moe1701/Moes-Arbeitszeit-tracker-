import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateMinutes } from '../../utils/timeCalculations';
import { exportMonthPDF } from '../../services/pdfExport';

export default function StatistikView() {
    const { appData } = useApp();
    const [viewDate, setViewDate] = useState(new Date());
    const [statMode, setStatMode] = useState('month'); // 'month', 'quarter', 'year'

    const changeStatPeriod = (dir) => {
        const newDate = new Date(viewDate);
        if (statMode === 'month') {
            newDate.setMonth(newDate.getMonth() + dir);
        } else if (statMode === 'quarter') {
            newDate.setMonth(newDate.getMonth() + (dir * 3));
        } else if (statMode === 'year') {
            newDate.setFullYear(newDate.getFullYear() + dir);
        }
        setViewDate(newDate);
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Dynamische Perioden-Titel
    let startMonth, endMonth, titleStr;
    if (statMode === 'month') {
        startMonth = month;
        endMonth = month;
        titleStr = viewDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
    } else if (statMode === 'quarter') {
        const q = Math.floor(month / 3);
        startMonth = q * 3;
        endMonth = startMonth + 2;
        titleStr = `Q${q + 1} ${year}`;
    } else if (statMode === 'year') {
        startMonth = 0;
        endMonth = 11;
        titleStr = `Jahr ${year}`;
    }

    // Statistik-Berechnungen durch useMemo gecached
    const stats = useMemo(() => {
        let totalNet = 0;
        let daysWorked = 0;
        let totalDaysInPeriod = 0;
        let tplDistribution = {};

        appData.templates.forEach(t => tplDistribution[t.name] = 0);
        tplDistribution['Individuell / Sonstige'] = 0;

        for (let m = startMonth; m <= endMonth; m++) {
            const daysInMonth = new Date(year, m + 1, 0).getDate();
            totalDaysInPeriod += daysInMonth;

            for (let i = 1; i <= daysInMonth; i++) {
                const dStr = `${year}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
                const entry = appData.entries[dStr];

                if (entry && entry.begin && entry.end) {
                    const bMin = calculateMinutes(entry.begin, entry.end);
                    const netStd = Math.max(0, (bMin - (parseFloat(entry.pause) || 0)) / 60);
                    if (netStd > 0) {
                        totalNet += netStd;
                        daysWorked++;

                        const matchedTpl = appData.templates.find(t => t.begin === entry.begin && t.end === entry.end && (parseFloat(t.pause) || 0) === (parseFloat(entry.pause) || 0));
                        if (matchedTpl) {
                            tplDistribution[matchedTpl.name] += netStd;
                        } else {
                            tplDistribution['Individuell / Sonstige'] += netStd;
                        }
                    }
                }
            }
        }

        const avgDay = daysWorked > 0 ? (totalNet / daysWorked) : 0;
        const avgWeek = totalNet / (totalDaysInPeriod / 7);

        const percent = appData.settings.model.percentage || 100;
        const effWeekly = appData.settings.model.hours * (percent / 100);
        const hrMonthlySoll = effWeekly * 13 / 3;
        
        let hrPeriodSoll = 0;
        if (statMode === 'month') hrPeriodSoll = hrMonthlySoll;
        else if (statMode === 'quarter') hrPeriodSoll = hrMonthlySoll * 3;
        else if (statMode === 'year') hrPeriodSoll = hrMonthlySoll * 12;

        const sortedTpls = Object.keys(tplDistribution)
            .map(k => ({name: k, hours: tplDistribution[k]}))
            .filter(x => x.hours > 0)
            .sort((a,b) => b.hours - a.hours);

        return { totalNet, hrPeriodSoll, avgDay, avgWeek, sortedTpls };
    }, [year, startMonth, endMonth, appData.entries, appData.templates, appData.settings, statMode]);

    const handleExportPDF = () => {
        const monthName = viewDate.toLocaleString('de-DE', { month: 'long' });
        exportMonthPDF(appData, year, month, monthName);
    };

    return (
        <div className="flex flex-col h-full gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm shrink-0 flex flex-col gap-2">
                <div className="flex justify-between items-center text-white">
                    <button onClick={() => changeStatPeriod(-1)} className="p-2 bg-blue-500 rounded-lg active:bg-blue-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div className="text-base font-bold">{titleStr}</div>
                    <button onClick={() => changeStatPeriod(1)} className="p-2 bg-blue-500 rounded-lg active:bg-blue-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
                
                <div className="flex bg-blue-700/50 p-1 rounded-lg">
                    {['month', 'quarter', 'year'].map(mode => (
                        <button 
                            key={mode}
                            onClick={() => setStatMode(mode)} 
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${statMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:text-white'}`}
                        >
                            {mode === 'month' ? 'Monat' : mode === 'quarter' ? 'Quartal' : 'Jahr'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 shrink-0">
                {[
                    { label: 'Gesamt (Ist)', value: stats.totalNet, color: 'text-blue-600' },
                    { label: 'HR Soll (Formel)', value: stats.hrPeriodSoll, color: 'text-slate-700' },
                    { label: 'Ø pro Tag', value: stats.avgDay, color: 'text-indigo-600' },
                    { label: 'Ø pro Woche', value: stats.avgWeek, color: 'text-emerald-600' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white py-3 px-1 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{kpi.label}</div>
                        <div className={`text-lg font-black ${kpi.color}`}>{kpi.value.toFixed(1)} h</div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
                <h2 className="font-bold text-slate-800 text-xs mb-3 shrink-0 border-b border-slate-100 pb-2 uppercase tracking-wide">
                    Verteilung der Arbeitszeit
                </h2>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
                    {stats.sortedTpls.length === 0 ? (
                        <div className="text-xs font-medium text-slate-400 text-center py-6">Keine Arbeitszeiten in diesem Zeitraum erfasst.</div>
                    ) : (
                        stats.sortedTpls.map(item => {
                            const percent = (item.hours / stats.totalNet) * 100;
                            return (
                                <div key={item.name} className="mb-3">
                                    <div className="flex justify-between text-[11px] font-bold mb-1.5 px-1">
                                        <span className="text-slate-700">{item.name}</span>
                                        <span className="text-blue-600">{item.hours.toFixed(1)} h <span className="text-slate-400 font-normal ml-1">({percent.toFixed(0)}%)</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="shrink-0 mt-auto">
                <button onClick={handleExportPDF} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:bg-indigo-700 text-sm transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Gewählten Monat als PDF exportieren
                </button>
            </div>
        </div>
    );
}