import React from 'react';

export default function PaintPalette({ templates, activePaintTemplate, setActivePaintTemplate, colors }) {
    return (
        <div className="bg-white p-2 rounded-xl shadow-sm border-l-4 border-indigo-500 shrink-0 border-y border-r border-slate-100">
            <div className="flex justify-between items-center mb-1.5">
                <h2 className="font-bold text-indigo-700 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                    Aktiver Pinsel
                </h2>
                <button onClick={() => setActivePaintTemplate(null)} className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full active:bg-slate-200">
                    Deaktivieren
                </button>
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button 
                    onClick={() => setActivePaintTemplate('clear')} 
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${activePaintTemplate === 'clear' ? 'bg-red-500 text-white shadow-inner scale-95 border-red-600' : 'bg-red-50 text-red-600 border-red-200 active:bg-red-100'}`}
                >
                    ❌ Löschen
                </button>
                
                {templates.map((t, index) => {
                    const isActive = activePaintTemplate === t.id;
                    const color = colors[index % colors.length];
                    const btnClass = isActive 
                        ? `${color.bg.replace('100', '600')} text-white shadow-inner scale-95 ${color.border.replace('200', '700')}` 
                        : `${color.bg} ${color.text} ${color.border} active:brightness-95 shadow-sm`;
                    
                    return (
                        <button key={t.id} onClick={() => setActivePaintTemplate(t.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${btnClass}`}>
                            🖌️ {t.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}