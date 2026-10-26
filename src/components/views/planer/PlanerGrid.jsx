import React from 'react';

export default function PlanerGrid({ cells, monthName, changeMonth, handleCellClick, activePaintTemplate, templates, colors }) {
    return (
        <div className="bg-white p-2 rounded-xl shadow-sm flex-1 flex flex-col min-h-0 border border-slate-100">
            <div className="flex justify-between items-center mb-2 shrink-0">
                <button onClick={() => changeMonth(-1)} className="p-1 bg-slate-100 text-slate-600 rounded active:bg-slate-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <div className="text-sm font-bold text-slate-700">{monthName}</div>
                <button onClick={() => changeMonth(1)} className="p-1 bg-slate-100 text-slate-600 rounded active:bg-slate-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[9px] font-bold text-slate-400 uppercase shrink-0">
                <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 grid-rows-6 flex-1 min-h-0">
                {cells.map(cell => {
                    if (cell.type === 'empty') return <div key={cell.id} className="bg-transparent"></div>;

                    let bgClass = cell.isWeekend ? "bg-slate-100 border-slate-200" : "bg-slate-50 border-slate-200";
                    let textHtml = null;

                    if (cell.tplMatch) {
                        const tplIndex = templates.findIndex(t => t.id === cell.tplMatch.id);
                        const color = colors[tplIndex % colors.length];
                        bgClass = `${color.bg} ${color.border}`;
                        textHtml = <div className={`text-[9px] font-bold ${color.text} mt-0.5 truncate w-full text-center`}>{cell.tplMatch.name.substring(0,6)}</div>;
                    } else if (cell.entry && cell.entry.begin) {
                        bgClass = "bg-slate-200 border-slate-300";
                        textHtml = <div className="text-[9px] font-bold text-slate-700 mt-0.5 truncate w-full text-center">{cell.netStd.toFixed(1)}h</div>;
                    }

                    return (
                        <div 
                            key={cell.id} 
                            onClick={() => handleCellClick(cell.id)}
                            className={`flex flex-col items-center justify-center p-1 relative border rounded-lg shadow-sm ${bgClass} ${activePaintTemplate ? 'cursor-pointer active:scale-95 transition-transform' : ''} overflow-hidden`}
                        >
                            <div className={`text-xs font-bold text-center ${cell.isWeekend ? 'text-slate-400' : 'text-slate-800'}`}>{cell.dayNum}</div>
                            {textHtml}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-2 text-center text-[9px] text-slate-400 shrink-0 font-medium">
                Tippe auf einen Tag, um die farbige Vorlage einzutragen.
            </div>
        </div>
    );
}