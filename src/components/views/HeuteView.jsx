import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTimeTracker } from '../../hooks/useTimeTracker';
import { getLocalDateString } from '../../utils/timeCalculations';

export default function HeuteView({ selectedDate, setSelectedDate }) {
    const { appData, updateAppData } = useApp();
    const [isSavedIndicator, setIsSavedIndicator] = useState(false);
    const tracker = useTimeTracker(selectedDate);

    const displayDate = selectedDate.split('-').reverse().join('.');
    const isToday = selectedDate === getLocalDateString(new Date());

    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(getLocalDateString(d));
    };

    const handleTogglePause = async () => {
        if (appData.activePauseStart) {
            const start = new Date(appData.activePauseStart);
            const diffMins = Math.round((new Date() - start) / 60000);
            const currentPause = parseFloat(tracker.entry.pause) || 0;
            await tracker.saveEntry({ pause: currentPause + diffMins });
            await updateAppData(prev => ({ ...prev, activePauseStart: null }));
        } else {
            await updateAppData(prev => ({ ...prev, activePauseStart: new Date().toISOString() }));
        }
    };

    const handleManualSave = async () => {
        setIsSavedIndicator(true);
        setTimeout(() => setIsSavedIndicator(false), 1000);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                    <button onClick={() => changeDate(-1)} className="p-3 bg-slate-50 text-slate-600 rounded-xl active:bg-slate-200 transition-colors z-30">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    
                    <div className="flex-1 relative flex justify-center items-center h-10 overflow-hidden rounded-lg">
                        <span className="text-xl font-black tracking-tight text-slate-800 pointer-events-none">{displayDate}</span>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                    </div>

                    <button onClick={() => changeDate(1)} className="p-3 bg-slate-50 text-slate-600 rounded-xl active:bg-slate-200 transition-colors z-30">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>

                {tracker.holiday && (
                    <div className={`text-center text-xs font-bold p-2 rounded-xl shadow-sm mb-1 ${tracker.holiday.isSchool ? "bg-blue-50 text-blue-600" : "bg-yellow-50 text-yellow-600"}`}>
                        {tracker.holiday.isSchool ? "🎒 " : "🎉 "} {tracker.holiday.name}
                    </div>
                )}

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {appData.templates.map(t => (
                        <button key={t.id} onClick={() => tracker.applyTemplate(t)} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm shadow-sm whitespace-nowrap active:bg-indigo-100 border border-indigo-100">{t.name}</button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <div className="bg-white py-4 px-2 rounded-2xl shadow-sm flex-1 flex flex-col items-center justify-center border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Netto-Arbeitszeit</div>
                        <div className="text-[2.5rem] leading-none font-black text-blue-600 tracking-tight">{tracker.nettoHours.toFixed(2)}h</div>
                        <div className={`text-[10px] font-bold mt-2 ${tracker.diffHours >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                            {tracker.diffHours !== 0 ? `${tracker.diffHours > 0 ? "+" : ""}${tracker.diffHours.toFixed(2)}h ${tracker.diffHours >= 0 ? "Überstunden" : "Minusstunden"}` : "0.00h zum Soll"}
                        </div>
                    </div>
                    
                    <button onClick={handleManualSave} className={`w-[85px] rounded-2xl shadow-md flex flex-col justify-center items-center transition-colors shrink-0 ${isSavedIndicator ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white active:bg-blue-700'}`}>
                        <svg className="w-8 h-8 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{isSavedIndicator ? 'Safe!' : 'Speichern'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3 min-h-0 py-2">
                {isToday && (
                    <div className="grid grid-cols-2 gap-3 shrink-0 mb-1">
                        <button onClick={tracker.handleQuickStamp} className={`py-2.5 px-2 rounded-xl font-bold shadow-sm border transition-colors flex flex-col items-center justify-center gap-0.5 ${!tracker.entry.begin ? 'bg-emerald-50 text-emerald-700 border-emerald-200 active:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 active:bg-rose-100'}`}>
                            {!tracker.entry.begin ? (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg><span className="text-[10px] uppercase tracking-wider">Kommen</span></>
                            ) : (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span className="text-[10px] uppercase tracking-wider">Gehen</span></>
                            )}
                        </button>
                        
                        <button onClick={handleTogglePause} className={`py-2.5 px-2 rounded-xl font-bold shadow-sm border transition-colors flex flex-col items-center justify-center gap-0.5 ${appData.activePauseStart ? 'bg-amber-500 text-white border-amber-600 active:bg-amber-600 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-200 active:bg-amber-100'}`}>
                            {appData.activePauseStart ? (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg><span className="text-[10px] uppercase tracking-wider">Pause beenden</span></>
                            ) : (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span className="text-[10px] uppercase tracking-wider">Pause starten</span></>
                            )}
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 shrink-0">
                    <div className="bg-white py-3 px-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center relative overflow-hidden active:bg-slate-50 transition-colors">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 pointer-events-none z-10">Beginn</label>
                        <span className="text-3xl font-black text-slate-800 pointer-events-none z-10">{tracker.entry.begin || '--:--'}</span>
                        <input type="time" value={tracker.entry.begin || ''} onChange={e => tracker.saveEntry({ begin: e.target.value })} className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                    </div>

                    <div className="bg-white py-3 px-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center relative overflow-hidden active:bg-slate-50 transition-colors">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 pointer-events-none z-10">Ende</label>
                        <span className="text-3xl font-black text-slate-800 pointer-events-none z-10">{tracker.entry.end || '--:--'}</span>
                        <input type="time" value={tracker.entry.end || ''} onChange={e => tracker.saveEntry({ end: e.target.value })} className="absolute top-0 left-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                    </div>

                    <div className="bg-white py-3 px-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center focus-within:ring-2 ring-slate-200 transition-all">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pause (Min)</label>
                        <input type="number" value={tracker.entry.pause !== undefined ? tracker.entry.pause : ''} onChange={e => tracker.saveEntry({ pause: e.target.value === '' ? '' : parseFloat(e.target.value) })} className="w-full text-3xl font-black bg-transparent border-none outline-none text-center text-indigo-600" placeholder="0" />
                    </div>
                    
                    <div className="bg-white py-3 px-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center focus-within:ring-2 ring-slate-200 transition-all">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Soll (Std)</label>
                        <input type="number" step="0.1" value={tracker.entry.soll !== undefined ? tracker.entry.soll : ''} onChange={e => tracker.saveEntry({ soll: e.target.value === '' ? 0 : parseFloat(e.target.value) })} className="w-full text-3xl font-black bg-transparent border-none outline-none text-center text-slate-500" />
                    </div>
                </div>

                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                    <input type="text" value={tracker.entry.remark || ''} onChange={e => tracker.saveEntry({ remark: e.target.value })} className="w-full text-base py-2 font-medium bg-transparent outline-none text-slate-700 placeholder-slate-400 text-center" placeholder="💬 Bemerkung (Krank, Urlaub, Notizen)" />
                </div>
            </div>

            <div className="shrink-0 mt-auto">
                <button onClick={tracker.clearEntry} className="w-full p-3 text-red-500 font-bold bg-red-50 rounded-xl active:bg-red-100 border border-red-100 transition-colors">Tageseintrag leeren</button>
            </div>
        </div>
    );
}