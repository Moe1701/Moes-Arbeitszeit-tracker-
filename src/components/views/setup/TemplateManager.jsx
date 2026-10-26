import React, { useState } from 'react';

const plannerColors = [
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' }
];

export default function TemplateManager({ appData, updateAppData }) {
    const [tplName, setTplName] = useState('');
    const [tplBegin, setTplBegin] = useState('');
    const [tplEnd, setTplEnd] = useState('');
    const [tplPause, setTplPause] = useState('');

    const addTemplate = async () => {
        if (tplName && tplBegin && tplEnd) {
            const newTpl = { id: Date.now(), name: tplName, begin: tplBegin, end: tplEnd, pause: parseInt(tplPause) || 0 };
            await updateAppData(prev => ({ ...prev, templates: [...prev.templates, newTpl] }));
            setTplName(''); setTplBegin(''); setTplEnd(''); setTplPause('');
        }
    };

    const deleteTemplate = async (id) => {
        await updateAppData(prev => ({ ...prev, templates: prev.templates.filter(t => t.id !== id) }));
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 border border-slate-100">
            <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-sm">Vorlagen anlegen</h2>
            <div className="grid grid-cols-4 gap-2">
                <input type="text" value={tplName} onChange={e => setTplName(e.target.value)} placeholder="Name (z.B. Früh)" className="col-span-4 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none" />
                <input type="time" value={tplBegin} onChange={e => setTplBegin(e.target.value)} className="col-span-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                <input type="time" value={tplEnd} onChange={e => setTplEnd(e.target.value)} className="col-span-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                <input type="number" value={tplPause} onChange={e => setTplPause(e.target.value)} placeholder="Pause (Min)" className="col-span-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                <button onClick={addTemplate} className="col-span-2 bg-indigo-600 text-white font-bold rounded-lg text-sm active:bg-indigo-700">Speichern</button>
            </div>
            
            <div className="space-y-2 mt-2">
                {appData.templates.map((t, index) => {
                    const color = plannerColors[index % plannerColors.length];
                    return (
                        <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${color.bg.replace('100', '500')}`}></div>
                                <div>
                                    <div className="font-bold text-sm text-slate-800">{t.name}</div>
                                    <div className="text-xs text-slate-500">{t.begin} - {t.end} ({t.pause || 0}m Pause)</div>
                                </div>
                            </div>
                            <button onClick={() => deleteTemplate(t.id)} className="text-red-400 p-2 active:bg-red-50 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}