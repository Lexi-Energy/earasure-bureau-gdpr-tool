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

  // Dynamic lists derived from your massive dataset
  const categories = useMemo(() => ['All', ...Array.from(new Set(services.map(s => s.category || 'Other'))).sort()], [services]);
  const regions = useMemo(() => ['All', ...Array.from(new Set(services.map(s => s.region || 'Global'))).sort()], [services]);

  // Toggle single item
  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ));
  };

  // Filter Logic
  const filteredAvailableServices = services.filter(s => {
    // Only show unselected items in the left "Directory" column? 
    // Actually, usually easier to see everything, but let's keep your "hide selected" logic 
    // or switch to "show all but indicate status"? 
    // Sticking to your original "hide selected" for the left column to keep it clean.
    if (s.selected) return false; 
    
    if (filterCategory !== 'All' && s.category !== filterCategory) return false;
    if (filterRegion !== 'All' && s.region !== filterRegion) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // --- NEW BULK LOGIC ---
  
  // 1. Select Everything currently visible in the left column
  const handleSelectAllVisible = () => {
     const visibleIds = new Set(filteredAvailableServices.map(s => s.id));
     if (visibleIds.size === 0) return;
     
     setServices(prev => prev.map(s => visibleIds.has(s.id) ? { ...s, selected: true } : s));
  };

  // 2. Clear ALL selections (Reset)
  const handleClearAll = () => {
    if (!window.confirm("Deselect all items?")) return;
    setServices(prev => prev.map(s => ({ ...s, selected: false })));
  };

  // 3. Select by Category (e.g. Brokers)
  const handleBulkSelectCategory = (categoryPrefix: string) => {
    setServices(prev => prev.map(s => {
       if (s.selected) return s;
       // Flexible match (e.g. "Data Broker" matches "Data Broker", "Brokers", etc.)
       if (s.category.toLowerCase().includes(categoryPrefix.toLowerCase())) return { ...s, selected: true };
       return s;
    }));
  };

  // Custom Add Logic
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

  // File Import Logic (Preserved)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let newServices: Service[] = [];
      
      try {
        if (file.name.endsWith('.json')) {
           const parsed = JSON.parse(content);
           if (Array.isArray(parsed)) {
             newServices = parsed.map((item: any) => ({
                id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: item.name || 'Unknown',
                email: item.email || '',
                category: item.category || 'Imported',
                region: item.region || 'Global',
                selected: true,
                status: RequestStatus.PENDING,
                confidence: (item.email ? 'High' : 'Low'),
                notes: 'Imported from JSON'
             })).filter((s: any) => s.name && s.name !== 'Unknown');
           }
        }
        
        if (newServices.length > 0) {
           setServices(prev => {
             const existingNames = new Set(prev.map(s => s.name.toLowerCase()));
             const uniqueNew = newServices.filter(s => !existingNames.has(s.name.toLowerCase()));
             alert(`Imported ${uniqueNew.length} new entries.`);
             return [...uniqueNew, ...prev];
           });
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse file.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const selectedCount = services.filter(s => s.selected).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto flex flex-col h-[80vh]">
      
      {/* --- HEADER CONTROL PANEL --- */}
      <div className="bg-white p-6 border border-paper-300 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-serif font-bold text-ink-900 flex items-center gap-3">
               <i className="fa-solid fa-database text-ink-400"></i>
               Target Discovery
             </h2>
             <div className="text-xs font-mono text-ink-400">
                DATABASE SIZE: {services.length}
             </div>
        </div>
        
        {/* Search & Add */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              placeholder="Search companies..."
              className="flex-1 bg-paper-50 border border-paper-300 focus:border-ink-900 p-2.5 font-serif outline-none"
            />
             <input 
              type="text" 
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="Email (opt)"
              className="w-32 bg-paper-50 border border-paper-300 focus:border-ink-900 p-2.5 font-mono text-xs outline-none"
            />
            <button 
              onClick={handleAddCustom}
              disabled={!searchTerm}
              className="bg-ink-900 text-white px-4 font-bold tracking-wide hover:bg-black transition-colors text-xs uppercase"
            >
              Add
            </button>
          </div>

          {/* FILTERS */}
          <div className="flex gap-2">
            <select 
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="bg-paper-50 border border-paper-300 p-2.5 font-mono text-xs cursor-pointer min-w-[120px]"
            >
              {regions.map(r => <option key={r} value={r}>{r === 'All' ? 'REGION: ALL' : r}</option>)}
            </select>

            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-paper-50 border border-paper-300 p-2.5 font-mono text-xs cursor-pointer min-w-[140px]"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'CATEGORY: ALL' : c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* --- DUAL PANE INTERFACE --- */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        
        {/* LEFT: AVAILABLE */}
        <div className="flex flex-col bg-white border border-paper-300 shadow-sm h-full overflow-hidden">
          <div className="p-3 border-b border-paper-200 bg-paper-50 flex justify-between items-center">
             <div className="font-bold text-ink-700 font-serif text-sm">
                Available <span className="text-ink-400 font-normal ml-1">({filteredAvailableServices.length})</span>
             </div>
             <button 
               onClick={handleSelectAllVisible}
               disabled={filteredAvailableServices.length === 0}
               className="text-[10px] font-bold uppercase tracking-wider text-ink-600 hover:text-ink-900 border border-paper-300 bg-white px-2 py-1 hover:border-ink-500"
             >
               Select Visible ({filteredAvailableServices.length}) <i className="fa-solid fa-arrow-right ml-1"></i>
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {filteredAvailableServices.map(service => (
              <div 
                key={service.id}
                onClick={() => toggleService(service.id)}
                className="group p-3 border border-paper-200 hover:border-ink-500 cursor-pointer bg-white hover:shadow-md transition-all flex justify-between items-center"
              >
                 <div>
                    <div className="font-bold text-ink-900 font-serif text-sm">{service.name}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-paper-100 text-ink-500 px-1.5 py-0.5 rounded-sm font-mono">{service.region}</span>
                      <span className="text-[10px] bg-paper-100 text-ink-500 px-1.5 py-0.5 rounded-sm font-mono">{service.category}</span>
                    </div>
                 </div>
                 <i className="fa-solid fa-plus text-paper-300 group-hover:text-ink-900"></i>
              </div>
            ))}
            {filteredAvailableServices.length === 0 && (
                <div className="text-center py-12 text-ink-400">No matches found.</div>
            )}
          </div>
          
          {/* Quick Bulk Adds */}
          <div className="p-3 border-t border-paper-200 bg-paper-50 flex gap-2 overflow-x-auto">
             <span className="text-[10px] font-mono font-bold text-ink-400 self-center whitespace-nowrap">QUICK ADD:</span>
             <button onClick={() => handleBulkSelectCategory('Broker')} className="text-[10px] bg-white border border-paper-300 px-2 py-1 hover:bg-ink-100 whitespace-nowrap">Brokers</button>
             <button onClick={() => handleBulkSelectCategory('Ad')} className="text-[10px] bg-white border border-paper-300 px-2 py-1 hover:bg-ink-100 whitespace-nowrap">AdTech</button>
             <button onClick={() => handleBulkSelectCategory('Social')} className="text-[10px] bg-white border border-paper-300 px-2 py-1 hover:bg-ink-100 whitespace-nowrap">Social</button>
          </div>
        </div>

        {/* RIGHT: SELECTED */}
        <div className="flex flex-col bg-white border border-stamp-200 shadow-md h-full overflow-hidden relative">
          <div className="p-3 border-b border-stamp-200 bg-stamp-50 flex justify-between items-center">
             <div className="font-bold text-stamp-900 font-serif text-sm">
                Queue <span className="bg-stamp-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{selectedCount}</span>
             </div>
             <button 
               onClick={handleClearAll}
               disabled={selectedCount === 0}
               className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-800 border border-red-200 bg-white px-2 py-1 hover:bg-red-50"
             >
               <i className="fa-solid fa-trash mr-1"></i> Clear All
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-paper-50">
             {services.filter(s => s.selected).map(service => (
              <div 
                key={service.id}
                className="flex justify-between items-center p-2 bg-white border-l-4 border-l-stamp-500 border-y border-r border-paper-200 shadow-sm"
              >
                 <div className="overflow-hidden">
                    <div className="font-bold text-sm text-ink-900 truncate">{service.name}</div>
                    <div className="text-[10px] font-mono text-ink-500 truncate">{service.email || "NO EMAIL"}</div>
                 </div>
                 <button 
                   onClick={() => toggleService(service.id)}
                   className="text-paper-400 hover:text-red-500 px-2"
                 >
                   <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
             ))}
          </div>
        </div>
      </div>

      {/* FOOTER NAV */}
      <div className="flex justify-between pt-4 border-t border-paper-300">
        <button onClick={onBack} className="text-ink-500 hover:text-ink-900 font-serif underline">
           Back to Profile
        </button>
        <button 
          onClick={onNext}
          disabled={selectedCount === 0}
          className={`px-8 py-3 font-bold tracking-wider uppercase shadow-md transition-all ${
            selectedCount > 0 ? 'bg-stamp-700 text-white hover:bg-stamp-800' : 'bg-paper-300 text-ink-400 cursor-not-allowed'
          }`}
        >
          Generate Emails <i className="fa-solid fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default DiscoveryStep;
