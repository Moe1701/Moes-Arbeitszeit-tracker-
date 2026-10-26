import React from 'react';

export default function ModelSettings({ appData, updateAppData }) {
    const { model } = appData.settings;
    const percent = model.percentage || 100;
    const effWeekly = model.hours * (percent / 100);
    const dailySoll = (effWeekly / Math.max(1, model.days.length)).toFixed(2);
    const hrMonthly = (effWeekly * 13 / 3).toFixed(1);

    const updateModel = async (key, value) => {
        await updateAppData(prev => ({
            ...prev, settings: { ...prev.settings, model: { ...prev.settings.model, [key]: value } }
        }));
    };

    const toggleWorkDay = async (dayInt) => {
        const currentDays = [...model.days];
        const idx = currentDays.indexOf(dayInt);
        if (idx > -1) currentDays.splice(idx, 1);
        else currentDays.push(dayInt);
        await updateModel('days', currentDays);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 border border-slate-100 relative">
            <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-sm">Arbeitszeit-Modell</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-3 pt-2">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Basis-Woche (h)</label>
                    <input type="number" value={model.hours} onChange={e => updateModel('hours', parseFloat(e.target.value) || 40)} className="w-full bg-transparent font-bold text-lg text-center outline-none p-0 m-0" />
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Stellenanteil (%)</label>
                    <input type="number" value={model.percentage} onChange={e => updateModel('percentage', parseFloat(e.target.value) || 100)} className="w-full bg-transparent font-bold text-lg text-center outline-none p-0 m-0" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <label className="block text-[10px] font-bold text-blue-400 mb-1 uppercase text-center">Tages-Soll (Ist)</label>
                    <div className="font-bold text-lg text-blue-600 text-center">{dailySoll} h</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <label className="block text-[10px] font-bold text-blue-400 mb-1 uppercase text-center">HR Monats-Soll</label>
                    <div className="font-bold text-lg text-blue-600 text-center">{hrMonthly} h</div>
                </div>
            </div>

            <div className="pt-2 border-t border-slate-50">
                <label className="block text-[10px] font-bold text-slate-400 mb-2.5 uppercase">Reguläre Arbeitstage</label>
                <div className="flex justify-between gap-1">
                    {[{ id: 1, label: 'Mo' }, { id: 2, label: 'Di' }, { id: 3, label: 'Mi' }, { id: 4, label: 'Do' }, { id: 5, label: 'Fr' }, { id: 6, label: 'Sa' }, { id: 0, label: 'So' }].map(day => (
                        <button 
                            key={day.id} onClick={() => toggleWorkDay(day.id)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${model.days.includes(day.id) ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' : 'bg-slate-100 text-slate-400 border-2 border-transparent'}`}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}