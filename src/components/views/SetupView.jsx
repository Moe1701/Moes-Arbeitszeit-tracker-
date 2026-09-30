import React from 'react';
import { useApp } from '../../context/AppContext';

export default function SetupView() {
    const { appData } = useApp();

    return (
        <div className="flex flex-col gap-4 pb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h1 className="text-lg font-black text-blue-600 mb-2">Einstellungen</h1>
                <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono">
                    Aktuelles Bundesland: <span className="font-bold text-blue-600">{appData.settings.state}</span>
                </div>
            </div>
        </div>
    );
}