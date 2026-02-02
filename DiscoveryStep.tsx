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
  const [showImportHelp, setShowImportHelp] = useState(false);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterRegion, setFilterRegion] = useState<string>('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(services.map(s => s.category))).sort()], [services]);
  const regions = useMemo(() => ['All', ...Array.from(new Set(services.map(s => s.region))).sort()], [services]);

  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ));
  };

  // Filter Logic calculated first so we can use it in "Select Visible"
  const filteredAvailableServices = services.filter(s => {
    if (s.selected) return false; // Don't show already selected in the left list
    if (filterCategory !== 'All' && s.category !== filterCategory) return false;
    if (filterRegion !== 'All' && s.region !== filterRegion) return false;
    if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleBulkSelect = (type: 'BROKERS' | 'VISIBLE' | 'ALL') => {
    if (type === 'VISIBLE') {
       // Selects everything currently showing in the left column
       const visibleIds = new Set(filteredAvailableServices.map(s => s.id));
       setServices(prev => prev.map(s => visibleIds.has(s.id) ? { ...s, selected: true } : s));
       return;
    }

    setServices(prev => prev.map(s => {
      if (s.selected) return s; // already selected
      
      if (type === 'BROKERS' && (s.category === 'Data Broker' || s.category === 'Ad Tech')) return { ...s, selected: true };
      if (type === 'ALL') return { ...s, selected: true };
      
      return s;
    }));
  };

  const handleAddCustom = () => {
    if (!searchTerm.trim()) return;

    const tempId = `custom-${Date.now()}`;
    
    const newService: Service = {
      id: tempId,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let newServices: Service[] = [];
      let importCount = 0;
      
      try {
        if (file.name.endsWith('.json')) {
           const parsed = JSON.parse(content);
           if (Array.isArray(parsed)) {
             newServices = parsed.map((item: any) => ({
                id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: item.name || 'Unknown',
                email: item.email || '',
                category: (item.category as any) || 'Imported',
                region: item.region || 'Global',
                selected: true,
                status: RequestStatus.PENDING,
                confidence: (item.email ? 'High' : 'Low') as Service['confidence'],
                notes: 'Imported from JSON'
             })).filter((s: any) => s.name && s.name !== 'Unknown');
           }
        } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
           const lines = content.split(/\r?\n/);
           // Heuristic: Check if first line looks like a header
           const firstLineLower = lines[0].toLowerCase();
           const hasHeader = firstLineLower.includes('name') || firstLineLower.includes('email');
           
           const dataLines = hasHeader ? lines.slice(1) : lines;

           newServices = dataLines.map((line) => {
              const cols = line.split(/,|;/).map(c => c.trim().replace(/^"|"$/g, ''));
              if (cols.length < 1 || !cols[0]) return null;
              
              // Assume Order: Name, Email, Category (Optional)
              // If only one column, it's just a name
              return {
                  id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: cols[0],
                  email: cols[1] || '',
                  category: (cols[2] as any) || 'Imported',
                  region: 'Global',
                  selected: true,
                  status: RequestStatus.PENDING,
                  confidence: (cols[1] ? 'High' : 'Low') as Service['confidence'],
                  notes: 'Imported from CSV'
              };
           }).filter(Boolean) as Service[];
        }
        
        if (newServices.length > 0) {
           setServices(prev => {
             // Avoid duplicates by name
             const existingNames = new Set(prev.map(s => s.name.toLowerCase()));
             const uniqueNew = newServices.filter(s => !existingNames.has(s.name.toLowerCase()));
             importCount = uniqueNew.length;
             return [...uniqueNew, ...prev];
           });
           
           if (importCount > 0) {
             alert(`Successfully imported ${importCount} new entries.`);
           } else {
             alert("File parsed, but all entries were duplicates.");
           }
        } else {
           alert("No valid entries found. Please check format (Name, Email).");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse file. Ensure it is valid JSON or CSV.");
      }
    };
    reader.readAsText(file);
    // Reset value so same file can be selected again
    event.target.value = '';
  };

  const selectedCount = services.filter(s => s.selected).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto flex flex-col">
      {/* Search & Filter Header (Paper Form Style) */}
      <div className="bg-white p-6 border border-paper-300 shadow-sm relative">
        <h2 className="text-2xl font-serif font-bold text-ink-900 mb-4 flex items-center gap-3">
          <i className="fa-solid fa-address-book text-ink-400 text-lg"></i>
          Directory & Manual Entry
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
          {/* Custom Search/Add Input */}
          <div className="flex-1 flex gap-2 w-full">
            <div className="flex-1">
                <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                placeholder="Search or Enter Company Name..."
                className="w-full bg-paper-50 border-b-2 border-paper-300 focus:border-ink-900 p-3 text-ink-900 outline-none font-serif placeholder:font-sans placeholder:text-paper-400"
                />
            </div>
            <div className="w-1/3">
                <input 
                type="text" 
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                placeholder="Email (Optional)..."
                className="w-full bg-paper-50 border-b-2 border-paper-300 focus:border-ink-900 p-3 text-ink-900 outline-none font-mono text-sm placeholder:font-sans placeholder:text-paper-400"
                />
            </div>
            <button 
              onClick={handleAddCustom}
              disabled={!searchTerm}
              className="bg-ink-900 hover:bg-black disabled:bg-paper-300 text-white px-6 font-bold tracking-wide transition-colors"
            >
              ADD
            </button>
          </div>

          {/* Select Filters */}
          <div className="flex gap-2">
            <select 
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="bg-paper-50 border border-paper-300 p-3 text-ink-900 outline-none font-mono text-sm cursor-pointer hover:border-ink-400"
            >
              <option value="All">REGION: ALL</option>
              {regions.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-paper-50 border border-paper-300 p-3 text-ink-900 outline-none font-mono text-sm cursor-pointer hover:border-ink-400"
            >
              <option value="All">CATEGORY: ALL</option>
              {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-paper-200 items-center justify-between">
           <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs font-bold text-ink-400 uppercase tracking-widest self-center mr-2 font-mono">Select Batch:</span>
            
            <button onClick={() => handleBulkSelect('VISIBLE')} className="text-xs bg-ink-900 text-white border border-ink-900 hover:bg-black px-3 py-1.5 transition-all font-mono shadow-sm">
                [X] SELECT CURRENT LIST ({filteredAvailableServices.length})
            </button>
            <button onClick={() => handleBulkSelect('BROKERS')} className="text-xs bg-paper-100 text-ink-700 border border-paper-300 hover:border-ink-500 hover:bg-white px-3 py-1.5 transition-all font-mono">
                [X] ALL BROKERS
            </button>
            <button onClick={() => handleBulkSelect('ALL')} className="text-xs bg-paper-100 text-ink-700 border border-paper-300 hover:border-ink-500 hover:bg-white px-3 py-1.5 transition-all font-mono">
                [X] SELECT ALL
            </button>
           </div>
           
           {/* File Import Button */}
           <div className="relative flex items-center gap-2">
             <input 
               type="file" 
               ref={fileInputRef}
               onChange={handleFileUpload}
               accept=".csv,.json,.txt"
               className="hidden"
             />
             <button 
                  onClick={() => setShowImportHelp(!showImportHelp)}
                  className={`text-xs px-2 py-1.5 font-serif border transition-colors ${showImportHelp ? 'bg-indigo-100 border-indigo-300 text-indigo-900' : 'bg-white border-paper-300 text-ink-500'}`}
                  title="Import Guide"
              >
                  <i className="fa-solid fa-circle-question mr-1"></i> Help
              </button>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-ink-100 text-ink-800 border border-ink-300 hover:bg-ink-200 px-4 py-1.5 font-bold uppercase tracking-wider flex items-center gap-2"
             >
                <i className="fa-solid fa-file-import"></i> Import List
             </button>
           </div>
        </div>
        
        {/* Import Help Box - Explicitly visible when toggled */}
        {showImportHelp && (
            <div className="mt-4 p-6 bg-indigo-50 border-l-4 border-indigo-400 shadow-sm animate-fade-in text-ink-800">
                <h4 className="font-bold text-indigo-900 font-serif mb-3 text-lg">
                    <i className="fa-solid fa-file-csv mr-2"></i> How to Import Your List
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h5 className="font-bold font-mono text-xs uppercase tracking-widest text-indigo-800 mb-2 border-b border-indigo-200 pb-1">OPTION A: CSV / Text File</h5>
                        <p className="text-sm mb-2">Upload a standard .csv or .txt file. The columns should be separated by commas.</p>
                        <div className="bg-white p-3 border border-indigo-200 font-mono text-xs leading-relaxed text-indigo-900 rounded-sm">
                            <span className="text-gray-400"># Format: Name, Email, Category(Optional)</span><br/>
                            Company A, support@companya.com<br/>
                            Company B, privacy@companyb.com, Shopping<br/>
                            Evil Data Corp, optout@evilcorp.com
                        </div>
                    </div>
                    <div>
                        <h5 className="font-bold font-mono text-xs uppercase tracking-widest text-indigo-800 mb-2 border-b border-indigo-200 pb-1">OPTION B: JSON File</h5>
                        <p className="text-sm mb-2">Upload a .json file containing an array of objects.</p>
                        <div className="bg-white p-3 border border-indigo-200 font-mono text-xs leading-relaxed text-indigo-900 rounded-sm">
                            [<br/>
                            &nbsp;&nbsp;{`{ "name": "Company A", "email": "a@a.com" }`},<br/>
                            &nbsp;&nbsp;{`{ "name": "Company B", "email": "b@b.com" }`}<br/>
                            ]
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Lists Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Available List (Directory) */}
        <div className="h-[600px] flex flex-col">
          <div className="pb-2 border-b-2 border-ink-900 mb-2 flex justify-between items-end">
             <h3 className="text-lg font-serif font-bold text-ink-900">Directory</h3>
             <span className="font-mono text-xs text-ink-500">{filteredAvailableServices.length} ENTRIES</span>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3 custom-scrollbar">
            {filteredAvailableServices.map(service => (
              <div 
                key={service.id}
                onClick={() => toggleService(service.id)}
                className="group p-4 bg-white border border-paper-300 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-ink-400 relative"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-serif font-bold text-ink-800 text-lg group-hover:text-black">
                      {service.name}
                    </div>
                    <div className="flex gap-2 mt-1">
                     <span className="text-[10px] uppercase font-bold tracking-wider border border-paper-300 px-1 text-ink-500 font-mono">{service.region}</span>
                     <span className="text-[10px] uppercase font-bold tracking-wider border border-paper-300 px-1 text-ink-500 font-mono">{service.category}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 border border-paper-300 flex items-center justify-center text-paper-300 group-hover:border-ink-900 group-hover:text-ink-900 transition-colors bg-paper-50">
                    <i className="fa-solid fa-plus"></i>
                  </div>
                </div>
              </div>
            ))}
             {filteredAvailableServices.length === 0 && (
                <div className="text-center text-ink-400 py-12 border-2 border-dashed border-paper-300 bg-paper-50">
                   <i className="fa-regular fa-folder-open text-2xl mb-2"></i>
                   <p className="font-serif italic">No matching records found.</p>
                </div>
             )}
          </div>
        </div>

        {/* Selected List (Pile) */}
        <div className="h-[600px] flex flex-col">
          <div className="pb-2 border-b-2 border-stamp-700 mb-2 flex justify-between items-end bg-paper-100 px-2 pt-2">
            <h3 className="text-lg font-serif font-bold text-stamp-800">For Processing</h3>
            <span className="bg-stamp-600 text-white font-mono text-xs px-2 py-0.5">{selectedCount}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-1 custom-scrollbar bg-paper-200/50 p-4 border border-paper-300 shadow-inner">
            {services.filter(s => s.selected).map(service => (
              <div 
                key={service.id}
                className={`p-3 bg-white border-l-4 border-y border-r border-paper-300 shadow-sm flex flex-col gap-1 group relative ${
                    service.category === 'Imported' ? 'border-l-indigo-600' : 'border-l-stamp-600'
                }`}
              >
                <div className="flex justify-between items-start">
                   <div>
                    <div className="font-bold text-ink-900 font-serif">
                       {service.name}
                    </div>
                    <div className="text-xs font-mono mt-0.5 flex items-center gap-2">
                      {service.email ? (
                        <span className="text-ink-500">{service.email}</span>
                      ) : (
                        <span className="text-stamp-600 font-bold bg-stamp-50 px-1">MISSING EMAIL</span>
                      )}
                      {service.category === 'Imported' && <span className="bg-indigo-100 text-indigo-700 px-1 rounded-[2px] font-bold">IMP</span>}
                    </div>
                   </div>
                   <button 
                    onClick={() => toggleService(service.id)}
                    className="text-paper-400 hover:text-stamp-600 transition-colors p-1 absolute top-2 right-2"
                   >
                     <i className="fa-solid fa-xmark"></i>
                   </button>
                </div>
              </div>
            ))}
             {selectedCount === 0 && (
                <div className="h-full flex items-center justify-center border-2 border-paper-300 border-dashed m-2 text-ink-400">
                   <div className="text-center">
                     <p className="font-serif italic mb-2">The queue is empty.</p>
                     <p className="text-xs font-mono">Select items from directory.</p>
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-paper-300">
        <button 
          onClick={onBack}
          className="text-ink-500 hover:text-ink-900 px-6 py-3 font-medium transition-colors font-serif underline underline-offset-4 decoration-paper-300 hover:decoration-ink-900"
        >
          Modify Identity
        </button>
        <button 
          onClick={onNext}
          disabled={selectedCount === 0}
          className={`px-8 py-3 font-bold tracking-wider uppercase transition-all shadow-md ${
            selectedCount > 0
              ? 'bg-stamp-700 text-white hover:bg-stamp-800 shadow-stamp-200' 
              : 'bg-paper-300 text-ink-400 cursor-not-allowed'
          }`}
        >
          Review & Execute <i className="fa-solid fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default DiscoveryStep;