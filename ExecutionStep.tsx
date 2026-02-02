import React, { useState } from 'react';
import { Service, UserProfile, RequestStatus, TemplateStyle } from './types';
import { generateGdprEmail } from './templates';
import JSZip from 'jszip';

interface Props {
  services: Service[];
  profile: UserProfile;
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  onBack: () => void;
}

const ExecutionStep: React.FC<Props> = ({ services, profile, setServices, onBack }) => {
  // Only process selected services
  const activeServices = services.filter(s => s.selected);
  
  // Selection in the bulk list
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(activeServices[0]?.id || null);
  const [isZipping, setIsZipping] = useState(false);
  
  // Local override for the preview
  const [previewStyle, setPreviewStyle] = useState<TemplateStyle>(profile.templateStyle || 'LEGAL');

  const selectedService = activeServices.find(s => s.id === selectedServiceId) || activeServices[0];
  
  // Generate using the local preview style, but keep profile data
  const { subject, body } = selectedService
    ? generateGdprEmail(selectedService.name, { ...profile, templateStyle: previewStyle }) 
    : { subject: '', body: '' };

  const handleStatusChange = (id: string, status: RequestStatus) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, status } : s
    ));
  };

  const handleOpenEmail = (service: Service, type: 'default' | 'gmail') => {
    const { subject, body } = generateGdprEmail(service.name, { ...profile, templateStyle: previewStyle });
    
    if (type === 'gmail') {
       const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(service.email || '')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
       window.open(gmailLink, '_blank');
    } else {
       const mailtoLink = `mailto:${service.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
       window.open(mailtoLink, '_blank');
    }
    
    // Auto-mark as sent for rapid fire
    handleStatusChange(service.id, RequestStatus.SENT);
  };

  const createEmlContent = (service: Service, style: TemplateStyle) => {
    const { subject, body } = generateGdprEmail(service.name, { ...profile, templateStyle: style });
    return `To: ${service.email || ''}
Subject: ${subject}
From: ${profile.email}
X-Unsent: 1
Content-Type: text/plain; charset="utf-8"

${body}`;
  };

  const downloadSingleEml = (service: Service) => {
    const emlContent = createEmlContent(service, previewStyle);
    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DELETE_${service.name.replace(/[^a-z0-9]/gi, '_')}.eml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    handleStatusChange(service.id, RequestStatus.SENT);
  };

  const downloadBulkZip = async () => {
    setIsZipping(true);
    const zip = new JSZip();
    const folder = zip.folder("Privacy_Erasure_Requests");

    activeServices.forEach(service => {
      if (service.email) {
        // Use the global profile style for bulk, unless we want to track individual overrides which is too complex for V1
        const emlContent = createEmlContent(service, profile.templateStyle);
        
        // Create valid filename
        const safeName = service.name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        folder?.file(`DELETE_${safeName}.eml`, emlContent);
        
        // Mark as sent in UI
        handleStatusChange(service.id, RequestStatus.SENT);
      }
    });

    try {
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Erasure_Requests_Batch_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to zip", error);
      alert("Failed to generate ZIP file");
    } finally {
      setIsZipping(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(body);
  };

  if (!selectedService) return <div>No services selected</div>;

  const sentCount = activeServices.filter(s => s.status === RequestStatus.SENT).length;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in pb-12">
       {/* Command Center Header */}
       <div className="flex flex-col md:flex-row justify-between items-center bg-ink-900 text-white p-6 shadow-md border-t-4 border-stamp-600">
         <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="text-ink-400 hover:text-white transition-colors border-r border-ink-700 pr-6 mr-2"
              title="Back to Selection"
            >
              <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>
            <div>
              <h2 className="text-xl font-bold font-serif flex items-center gap-3">
                <i className="fa-solid fa-stamp text-stamp-500"></i>
                Execution Desk
              </h2>
              <p className="text-xs text-ink-300 mt-1 max-w-xl font-mono">
                Generating legal requests for {activeServices.length} entities.
              </p>
            </div>
         </div>
         <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="text-right border-r border-ink-700 pr-6">
              <div className="text-3xl font-bold font-mono text-white leading-none">{sentCount} / {activeServices.length}</div>
              <div className="text-[10px] text-ink-400 uppercase tracking-widest mt-1">Files Processed</div>
            </div>
            
            <button 
               onClick={downloadBulkZip}
               disabled={isZipping}
               className="bg-stamp-700 hover:bg-stamp-600 disabled:bg-ink-800 px-6 py-3 font-bold shadow-lg flex items-center gap-3 transition-all uppercase tracking-wider border border-stamp-500 hover:border-white"
            >
               {isZipping ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-zipper"></i>}
               Download Batch (.ZIP)
            </button>
         </div>
       </div>

       {/* Instruction Banner */}
       <div className="bg-paper-200 border border-paper-300 p-4 flex gap-4 items-center">
         <div className="bg-white p-2 rounded-full w-8 h-8 flex items-center justify-center font-bold font-serif border border-paper-300">i</div>
         <div className="text-sm font-serif text-ink-700 flex-1">
           <strong>How to Bulk Send:</strong> Download the ZIP &rarr; Unzip it &rarr; Select all <code>.eml</code> files &rarr; Drag them into your Email Client's "Drafts" or "Outbox" &rarr; Review and click Send.
           <span className="block text-xs font-mono mt-1 text-ink-500">Recommended: Send in batches of 20 to avoid spam filters.</span>
         </div>
       </div>

       <div className="flex gap-8 h-[600px]">
          
          {/* List View (Left) - File List */}
          <div className="w-1/3 bg-white border border-paper-300 shadow-sm flex flex-col overflow-hidden">
             <div className="p-3 bg-paper-100 border-b border-paper-300 font-bold text-ink-600 text-xs uppercase tracking-widest flex">
                <div className="flex-1 pl-2">Entity</div>
                <div className="w-20 text-center">Status</div>
             </div>
             
             <div className="overflow-y-auto flex-1 bg-paper-50 custom-scrollbar">
                {activeServices.map(service => (
                   <div 
                      key={service.id}
                      onClick={() => { setSelectedServiceId(service.id); setPreviewStyle(profile.templateStyle || 'LEGAL'); }}
                      className={`p-4 border-b border-paper-200 cursor-pointer transition-colors group relative ${
                         selectedServiceId === service.id 
                           ? 'bg-white border-l-4 border-l-ink-900 z-10 shadow-sm' 
                           : 'hover:bg-white hover:border-l-4 hover:border-l-paper-400 border-l-4 border-l-transparent'
                      }`}
                   >
                      <div className="flex justify-between items-center mb-1">
                         <h4 className={`font-serif font-bold text-sm ${service.status === RequestStatus.SENT ? 'text-ink-400 line-through decoration-stamp-500 decoration-2' : 'text-ink-900'}`}>{service.name}</h4>
                         {service.status === RequestStatus.SENT && <i className="fa-solid fa-check text-stamp-600"></i>}
                      </div>
                      <div className="text-xs font-mono text-ink-500 truncate">{service.email || 'NO CONTACT FOUND'}</div>
                   </div>
                ))}
             </div>
          </div>

          {/* Preview Panel (Right) - The Letter */}
          <div className="w-2/3 flex flex-col gap-4 h-full">
             {/* Action Bar */}
             <div className="flex justify-between items-center bg-paper-100 p-3 border border-paper-300 rounded-sm">
                <div className="flex gap-2">
                   <button 
                      onClick={() => handleOpenEmail(selectedService, 'default')}
                      disabled={!selectedService.email}
                      className="px-4 py-2 bg-white border border-paper-300 hover:border-ink-900 text-ink-900 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                   >
                      <i className="fa-solid fa-envelope mr-2"></i> Mail App
                   </button>
                   <button 
                      onClick={() => handleOpenEmail(selectedService, 'gmail')}
                      disabled={!selectedService.email}
                      className="px-4 py-2 bg-white border border-paper-300 hover:border-red-600 hover:text-red-700 text-ink-600 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                   >
                      <i className="fa-brands fa-google mr-2"></i> Gmail
                   </button>
                </div>
                
                <div className="flex gap-2 items-center">
                   {/* Template Override Dropdown */}
                   <select 
                      value={previewStyle} 
                      onChange={(e) => setPreviewStyle(e.target.value as TemplateStyle)}
                      className="text-xs border border-paper-300 bg-white py-2 px-2 font-mono uppercase focus:border-ink-900 outline-none"
                   >
                      <option value="SIMPLE">Style: Personal (USP)</option>
                      <option value="LEGAL">Style: Legal</option>
                      <option value="AGGRESSIVE">Style: Aggressive</option>
                   </select>

                  <button 
                     onClick={() => downloadSingleEml(selectedService)}
                     className="px-4 py-2 bg-ink-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                  >
                     <i className="fa-solid fa-download mr-2"></i> .EML File
                  </button>
                  <button 
                      onClick={(e) => { e.stopPropagation(); handleStatusChange(selectedService.id, selectedService.status === RequestStatus.SENT ? RequestStatus.PENDING : RequestStatus.SENT); }}
                      className={`px-3 py-2 border ${
                         selectedService.status === RequestStatus.SENT 
                         ? 'bg-stamp-50 text-stamp-700 border-stamp-200' 
                         : 'bg-white text-ink-400 border-paper-300 hover:border-ink-400'
                      }`}
                      title="Toggle Processed Status"
                   >
                      <i className="fa-solid fa-check"></i>
                   </button>
                </div>
             </div>

             {/* Letter Preview - Paper styling */}
             <div className="bg-white text-ink-900 shadow-md flex-1 border border-paper-200 relative p-8 md:p-12 overflow-y-auto custom-scrollbar group min-h-0">
                <div className="absolute top-0 left-0 w-full h-2 bg-paper-200/50 striped-bar"></div>
                
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 bg-paper-100 border border-paper-300 text-ink-600 hover:text-ink-900 text-xs px-3 py-1 uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Copy Text
                </button>

                <div className="max-w-2xl mx-auto">
                  <div className="mb-8 border-b border-paper-200 pb-4">
                    <p className="font-mono text-xs text-ink-500 mb-1">RE: {selectedService.name.toUpperCase()}</p>
                    <p className="font-serif font-bold text-lg">{subject}</p>
                  </div>
                  
                  <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap text-ink-800">
                    {body}
                  </div>

                  <div className="mt-12 pt-8 border-t border-paper-200 flex justify-between items-center">
                     <div className="font-mono text-xs text-ink-400">
                        REF: GDPR-ART17-{new Date().getFullYear()}
                     </div>
                     <div className="border-2 border-stamp-600 text-stamp-600 font-bold uppercase text-xs px-2 py-1 -rotate-6 opacity-80">
                        Right to Erasure
                     </div>
                  </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ExecutionStep;