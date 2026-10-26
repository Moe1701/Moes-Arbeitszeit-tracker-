import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateDailySoll, calculateMinutes } from '../../utils/timeCalculations';
import PaintPalette from './planer/PaintPalette';
import PlanerGrid from './planer/PlanerGrid';
import AutoFillMenu from './planer/AutoFillMenu';

const plannerColors = [
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' }
];

export default function PlanerView() {
    const { appData, updateAppData } = useApp();
    
    const [viewDate, setViewDate] = useState(new Date());
    const [activePaintTemplate, setActivePaintTemplate] = useState(null);
    const [pattern, setPattern] = useState({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 0: '' });
    const [overwritePattern, setOverwritePattern] = useState(false);

    const changeMonth = (dir) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + dir);
        setViewDate(newDate);
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });

    const handleCellClick = async (dStr) => {
        if (!activePaintTemplate) return;
        if (appData.settings.protectHolidays && appData.holidays[dStr] && !appData.holidays[dStr].isSchool) return;

        await updateAppData(prev => {
            const newEntries = { ...prev.entries };
            const existing = newEntries[dStr] || {};

            if (activePaintTemplate === 'clear') {
                delete newEntries[dStr];
            } else {
                const t = prev.templates.find(x => x.id === activePaintTemplate);
                if (t) {
                    newEntries[dStr] = {
                        begin: t.begin, end: t.end, pause: t.pause !== undefined ? t.pause : 30,
                        soll: existing.soll !== undefined ? existing.soll : calculateDailySoll(dStr, prev.settings, prev.holidays),
                        remark: existing.remark || ''
                    };
                }
            }
            return { ...prev, entries: newEntries };
        });
    };

    const applyPattern = async () => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let count = 0;

        await updateAppData(prev => {
            const newEntries = { ...prev.entries };
            for (let i = 1; i <= daysInMonth; i++) {
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const tplId = pattern[new Date(dStr).getDay()];

                if (prev.settings.protectHolidays && prev.holidays[dStr] && !prev.holidays[dStr].isSchool) continue;

                if (tplId) {
                    const existing = newEntries[dStr];
                    if (!existing || overwritePattern) {
                        const t = prev.templates.find(x => x.id === Number(tplId));
                        if (t) {
                            newEntries[dStr] = {
                                begin: t.begin, end: t.end, pause: t.pause !== undefined ? t.pause : 30,
                                soll: existing && existing.soll !== undefined ? existing.soll : calculateDailySoll(dStr, prev.settings, prev.holidays),
                                remark: existing ? existing.remark : ''
                            };
                            count++;
                        }
                    }
                }
            }
            return { ...prev, entries: newEntries };
        });
        alert(`${count} Schichten in diesen Monat eingetragen!`);
    };

    const toggleProtectHolidays = async () => {
        await updateAppData(prev => ({
            ...prev, settings: { ...prev.settings, protectHolidays: !prev.settings.protectHolidays }
        }));
    };

    const cells = useMemo(() => {
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 7 : firstDay;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const gridCells = [];

        for (let i = 1; i < firstDay; i++) gridCells.push({ type: 'empty', id: `empty-${i}` });

        for (let i = 1; i <= daysInMonth; i++) {
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isWeekend = (new Date(dStr).getDay() === 0 || new Date(dStr).getDay() === 6);
            const entry = appData.entries[dStr];
            let tplMatch = null, netStd = 0;

            if (entry && entry.begin && entry.end) {
                const bMin = calculateMinutes(entry.begin, entry.end);
                netStd = Math.max(0, (bMin - (parseFloat(entry.pause) || 0)) / 60);
                tplMatch = appData.templates.find(t => t.begin === entry.begin && t.end === entry.end && (t.pause || 0) === (entry.pause || 0));
            }
            gridCells.push({ type: 'day', id: dStr, dayNum: i, isWeekend, entry, tplMatch, netStd });
        }
        
        while (gridCells.length < 42) gridCells.push({ type: 'empty', id: `empty-end-${gridCells.length}` });
        return gridCells;
    }, [year, month, appData.entries, appData.templates]);

    return (
        <div className="flex flex-col h-full gap-2">
            <PaintPalette 
                templates={appData.templates} activePaintTemplate={activePaintTemplate} 
                setActivePaintTemplate={setActivePaintTemplate} colors={plannerColors} 
            />
            <PlanerGrid 
                cells={cells} monthName={monthName} changeMonth={changeMonth} 
                handleCellClick={handleCellClick} activePaintTemplate={activePaintTemplate} 
                templates={appData.templates} colors={plannerColors} 
            />
            <AutoFillMenu 
                templates={appData.templates} protectHolidays={appData.settings.protectHolidays} 
                toggleProtectHolidays={toggleProtectHolidays} pattern={pattern} setPattern={setPattern} 
                overwritePattern={overwritePattern} setOverwritePattern={setOverwritePattern} applyPattern={applyPattern} 
            />
        </div>
    );
}