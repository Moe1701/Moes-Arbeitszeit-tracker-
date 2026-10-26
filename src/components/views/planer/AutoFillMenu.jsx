import React from 'react';

export default function AutoFillMenu({ 
    templates, protectHolidays, toggleProtectHolidays, 
    pattern, setPattern, overwritePattern, setOverwritePattern, applyPattern 
}) {
    return (
        <details className="bg-white rounded-xl shadow-sm shrink-0 border border-slate-100 group">
            <summary className="p-2.5 font-bold text-blue-700 flex items-center justify-between text-xs cursor-pointer list-none outline-none">
                <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Ganzen Monat automatisch füllen
                </span>
                <svg className="w-4 h-4 transition-transform group-open:rotate-180 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </summary>
            
            <div className="p-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-500">Wochenmuster</span>
                    <label className="flex items-center gap-1.5 cursor-pointer" onClick={toggleProtectHolidays}>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Feiertage frei</span>
                        <div className={`w-7 h-3.5 rounded-full relative transition-colors ${protectHolidays ? 'bg-blue-500' : 'bg-slate-300'}`}>
                            <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${protectHolidays ? 'translate-x-[12px]' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, idx) => {
                        const jsDay = idx === 6 ? 0 : idx + 1;
                        return (
                            <div key={day} className={`flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded flex-1 ${idx === 6 ? 'col-span-2' : ''}`}>
                                <span className="text-[9px] font-bold w-4 text-slate-500">{day}</span>
                                <select 
                                    value={pattern[jsDay]} 
                                    onChange={(e) => setPattern({...pattern, [jsDay]: e.target.value})}
                                    className="flex-1 p-1 border border-slate-200 rounded text-[9px] font-bold bg-white outline-none"
                                >
                                    <option value="">- Frei -</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <label className="flex items-center gap-1.5 cursor-pointer p-1">
                        <input 
                            type="checkbox" 
                            checked={overwritePattern}
                            onChange={(e) => setOverwritePattern(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded" 
                        />
                        <span className="text-[9px] font-bold text-slate-500">Überschreiben</span>
                    </label>
                    <button onClick={applyPattern} className="px-3 py-1.5 rounded-md font-bold bg-blue-600 text-white shadow-sm active:bg-blue-700 text-[10px]">
                        Eintragen
                    </button>
                </div>
            </div>
        </details>
    );
}