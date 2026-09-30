// src/App.jsx
import { useApp } from './context/AppContext.jsx';

export default function App() {
    const { appData } = useApp();

    return (
        <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto relative pt-3 pb-2 px-3 flex flex-col">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mt-10">
                <h1 className="text-xl font-black text-rose-600 mb-2">Zeiterfassung DEV</h1>
                <p className="text-sm text-slate-500">
                    Die React-Infrastruktur steht. IndexedDB ist verbunden.
                </p>
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs font-mono">
                    Gespeichertes Bundesland: <span className="font-bold text-blue-600">{appData.settings.state}</span>
                </div>
            </div>
        </main>
    );
}