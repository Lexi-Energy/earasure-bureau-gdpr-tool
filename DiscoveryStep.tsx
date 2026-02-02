import React, { useState, useMemo, useRef } from 'react';
import { Service, RequestStatus } from './types';

interface Props {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  onNext: () => void;
  onBack: () => void;
}

const DiscoveryStep: React.FC<Props> = ({ services, setServices, onNext, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterRegion, setFilterRegion] = useState<string>('All');

  // --- DYNAMIC FILTERS ---
  // Scan the 3000+ entries to find all unique regions (DE, FR, US, etc.)
  const regions = useMemo(() => {
    const unique = new Set(services.map(s => s.region || 'Global'));
    return ['All', ...Array.from(unique).sort()];
  }, [services]);

  const categories = useMemo(() => {
    const unique = new Set(services.map(s => s.category || 'Other'));
    return ['All', ...Array.from(unique).sort()];
  }, [services]);

  // Toggle single item
  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ));
  };

  // Filter Logic: "What is currently visible in the left list?"
  const filteredAvailableServices = services.filter(s => {
    if (s.selected) return false; // Hide if already selected (moved to right list)
    
    if (filterCategory !== 'All' && s.category !== filterCategory) return false;
    if (filterRegion !== 'All' && s.region !== filterRegion) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // --- BULK ACTIONS ---

  // 1. Select Visible: Selects only what passes the current filters
  const handleSelectVisible = () => {
     const visibleIds = new Set(filteredAvailableServices.map(s => s.id));
     if (visibleIds.size === 0) return;
     setServices(prev => prev.map(s => visibleIds.has(s.id) ? { ...s, selected: true } : s));
  };

  // 2. Select All Brokers (Shortcut)
  const handleSelectBrokers = () => {
    setServices(prev => prev.map(s => {
       if (s.selected) return s;
       // Flexible match for "Broker", "Ad Tech", "Address"
       const cat = s.category.toLowerCase();
       if (cat.includes('broker') || cat.includes('ad') || cat.includes('address')) {
         return { ...s, selected: true };
       }
       return s;
    }));
  };

  // 3. NUCLEAR OPTION: Clear Everything
  const handleClearQueue = () => {
    if (window.confirm('WARNING: This will remove ALL items from your queue. Are you sure?')) {
      setServices(prev => prev.map(s => ({ ...s, selected: false })));
    }
  };

  // Custom Add
  const handleAddCustom = () => {
    if (!searchTerm.trim()) return;
    const newService: Service = {
      id: `custom-${Date.now()}`,
      name: searchTerm,
      category: 'Other',
      region: 'Global',
      email: customEmail.trim() || undefined,
      confidence: customEmail.trim() ? 'High' : 'Low',
      selected: true,
      status: RequestStatus.PENDING,
      notes: 'Manually added'
    };
    setServices(prev => [newService, ...prev]);
    setSearchTerm('');
    setCustomEmail('');
  };

  const selectedCount = services.filter(s => s.selected).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto flex flex-col h-[85vh]">
      
      {/* --- TOP CONTROL PANEL --- */}
      <div className="bg-white p-5 border-2 border-paper-300 shadow-sm flex flex-col gap-4">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
           <div>
             <h2 className="text-xl font-serif font-bold text-ink-900 flex items-center gap-2">
               <i className="fa-solid fa-magnifying-glass text-ink-400"></i>
               Discovery
             </h2>
             <div className="text-[10px] font-mono text-ink-400 mt-1">
                DATABASE: {services.length} TARGETS
             </div>
           </div>

           {/* Search Bar */}
           <div className="flex-1 flex gap-2 max-w-2xl">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                  placeholder="Search database or add new..."
                  className="w-full bg-paper-50 border border-paper-300 p-2.5 font-serif outline-none focus:border-ink-900 focus:bg-white transition-colors"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2.5 text-paper-400 hover:text-ink-900">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                )}
              </div>
              <input 
                type="text" 
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="Email (for new)..."
                className="w-32 bg-paper-50 border border-paper-300 p-2.5 font-mono text-xs outline-none focus:border-ink-900"
              />
              <button 
                onClick={handleAddCustom}
                disabled={!searchTerm}
                className="bg-ink-900 text-white px-4 font-bold uppercase hover:bg-black transition-colors text-xs"
              >
                Add Custom
              </button>
           </div>
        </div>

        {/* Filters & Bulk Tools */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-paper-200">
            <div className="flex items-center gap-2 mr-4">
                <i className="fa-solid fa-filter text-ink-300"></i>
                
                {/* Dynamic Region Filter */}
                <select 
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="bg-white border border-paper-300 py-1 px-2 font-mono text-xs cursor-pointer hover:border-ink-500 rounded-sm"
                >
                  <option value="All">REGION: ALL</option>
                  {regions.filter(r => r !== 'All').map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                {/* Dynamic Category Filter */}
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white border border-paper-300 py-1 px-2 font-mono text-xs cursor-pointer hover:border-ink-500 rounded-sm"
                >
                  <option value="All">CATEGORY: ALL</option>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
            </div>

            <div className="h-4 w-px bg-paper-300 mx-2"></div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
                <button 
                    onClick={handleSelectVisible}
                    disabled={filteredAvailableServices.length === 0}
                    className="text-[10px] font-bold uppercase tracking-wider text-ink-700 hover:text-white hover:bg-ink-700 border border-paper-300 px-3 py-1.5 transition-colors"
                >
                    Select Visible ({filteredAvailableServices.length})
                </button>
                <button 
                    onClick={handleSelectBrokers}
                    className="text-[10px] font-bold uppercase tracking-wider text-ink-700 hover:text-white hover:bg-ink-700 border border-paper-300 px-3 py-1.5 transition-colors"
                >
                    Add All Brokers
                </button>
            </div>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        
        {/* LEFT: DIRECTORY (Available) */}
        <div className="flex flex-col bg-white border border-paper-300 shadow-sm h-full overflow-hidden">
          <div className="p-2 border-b border-paper-200 bg-paper-50 text-xs font-mono text-ink-500 uppercase tracking-widest text-center">
             Available Directory
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {filteredAvailableServices.length > 0 ? (
                filteredAvailableServices.map(service => (
                <div 
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className="group p-3 border border-paper-200 hover:border-ink-600 cursor-pointer bg-white hover:shadow-md transition-all flex justify-between items-center"
                >
                    <div className="overflow-hidden">
                        <div className="font-bold text-ink-900 font-serif text-sm truncate pr-2">{service.name}</div>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[9px] uppercase tracking-wider bg-paper-100 text-ink-600 px-1.5 py-0.5 rounded-sm">{service.region}</span>
                            <span className="text-[9px] uppercase tracking-wider bg-paper-100 text-ink-600 px-1.5 py-0.5 rounded-sm truncate max-w-[150px]">{service.category}</span>
                        </div>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center text-paper-300 group-hover:text-ink-900">
                        <i className="fa-solid fa-plus"></i>
                    </div>
                </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-40 text-ink-400">
                    <i className="fa-regular fa-folder-open text-2xl mb-2"></i>
                    <p className="font-serif italic text-sm">No matching targets.</p>
                </div>
            )}
          </div>
        </div>

        {/* RIGHT: QUEUE (Selected) */}
        <div className="flex flex-col bg-white border border-stamp-200 shadow-md h-full overflow-hidden relative">
          <div className="p-2 border-b border-stamp-200 bg-stamp-50 flex justify-between items-center px-4">
             <div className="font-bold text-stamp-900 font-serif text-sm flex items-center gap-2">
                Execution Queue 
                <span className="bg-stamp-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">{selectedCount}</span>
             </div>
             
             {/* THE CLEAR BUTTON YOU WANTED */}
             <button 
               onClick={handleClearQueue}
               disabled={selectedCount === 0}
               className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-white hover:bg-red-600 border border-red-200 bg-white px-2 py-1 transition-colors rounded-sm"
             >
               <i className="fa-solid fa-trash-can mr-1"></i> Clear Queue
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-paper-50/50">
             {services.filter(s => s.selected).length > 0 ? (
                 services.filter(s => s.selected).map(service => (
                  <div 
                    key={service.id}
                    className="flex justify-between items-center p-2 bg-white border-l-4 border-l-stamp-500 border-y border-r border-paper-200 shadow-sm group hover:border-r-red-400"
                  >
                     <div className="overflow-hidden">
                        <div className="font-bold text-sm text-ink-900 truncate">{service.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                             {service.email ? (
                                <div className="text-[10px] font-mono text-ink-500 truncate">{service.email}</div>
                             ) : (
                                <div className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1">MISSING EMAIL</div>
                             )}
                             <span className="text-[9px] text-paper-400">{service.region}</span>
                        </div>
                     </div>
                     <button 
                       onClick={() => toggleService(service.id)}
                       className="text-paper-300 hover:text-red-500 px-3 py-1 transition-colors"
                       title="Remove from queue"
                     >
                       <i className="fa-solid fa-xmark"></i>
                     </button>
                  </div>
                 ))
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-ink-300 border-2 border-dashed border-paper-200 m-4">
                   <p className="font-serif italic text-sm">Your queue is empty.</p>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* FOOTER NAV */}
      <div className="flex justify-between pt-4 border-t border-paper-300">
        <button 
            onClick={onBack} 
            className="text-ink-500 hover:text-ink-900 font-serif underline underline-offset-4"
        >
           &larr; Back to Profile
        </button>
        <button 
          onClick={onNext}
          disabled={selectedCount === 0}
          className={`px-8 py-3 font-bold tracking-wider uppercase shadow-md transition-all flex items-center gap-2 ${
            selectedCount > 0 ? 'bg-stamp-700 text-white hover:bg-stamp-800 hover:shadow-lg' : 'bg-paper-300 text-ink-400 cursor-not-allowed'
          }`}
        >
          Proceed to Generate <i className="fa-solid fa-file-contract"></i>
        </button>
      </div>
    </div>
  );
};

export default DiscoveryStep;
