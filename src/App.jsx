// src/App.jsx
import { useState } from 'react';
import { useApp } from './context/AppContext.jsx';
import BottomNav from './components/layout/BottomNav.jsx';

import HeuteView from './components/views/HeuteView.jsx';
import KalenderView from './components/views/KalenderView.jsx';
import PlanerView from './components/views/PlanerView.jsx';
import StatistikView from './components/views/StatistikView.jsx';
import SetupView from './components/views/SetupView.jsx';

export default function App() {
    // appData wird hier aufgerufen, um sicherzustellen, dass der Context funktioniert.
    const { appData } = useApp();
    const [activeTab, setActiveTab] = useState('heute');

    const renderView = () => {
        switch (activeTab) {
            case 'heute': return <HeuteView />;
            case 'kalender': return <KalenderView />;
            case 'planer': return <PlanerView />;
            case 'statistik': return <StatistikView />;
            case 'setup': return <SetupView />;
            default: return <HeuteView />;
        }
    };

    return (
        <div className="flex flex-col h-dvh overflow-hidden">
            {/* Main Content Area: Scrollbar, flex-1 füllt den Platz bis zur Nav */}
            <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto relative pt-3 pb-2 px-3 flex flex-col">
                {renderView()}
            </main>
            
            {/* Navigation Area: Fixiert am unteren Rand, selbe max-width wie Content für Desktop-Ansichten */}
            <div className="w-full max-w-lg mx-auto shrink-0 z-20">
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
    );
}