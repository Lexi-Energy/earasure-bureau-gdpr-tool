import React, { useState, useEffect } from 'react';
import { UserProfile, Service, WizardStep, RequestStatus } from './types';
import { INITIAL_SERVICES } from './constants';
import ProfileStep from './ProfileStep';
import DiscoveryStep from './DiscoveryStep';
import ExecutionStep from './ExecutionStep';

const App: React.FC = () => {
  const [step, setStep] = useState<WizardStep>('PROFILE');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    includeSpeculative: false,
    isEuCitizen: false,
    templateStyle: 'LEGAL',
    language: 'EN' // Default
  });

  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('erasure_profile');
    const savedServices = localStorage.getItem('erasure_services');

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }

    if (savedServices) {
      try {
        const parsedSavedServices = JSON.parse(savedServices);
        // We merge saved status/selection with INITIAL_SERVICES to ensure new database entries appear
        // but we keep the user's progress on existing ones.
        const mergedServices = INITIAL_SERVICES.map(initService => {
          const saved = parsedSavedServices.find((s: Service) => s.id === initService.id);
          if (saved) {
            return { 
              ...initService, 
              selected: saved.selected, 
              status: saved.status 
            };
          }
          return initService;
        });
        
        // Also add any custom services the user added (that are not in INITIAL)
        const customServices = parsedSavedServices.filter((s: Service) => 
          !INITIAL_SERVICES.find(init => init.id === s.id)
        );

        setServices([...customServices, ...mergedServices]);
      } catch (e) {
        console.error("Failed to load services", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('erasure_profile', JSON.stringify(profile));
    }
  }, [profile, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      // We only save modified services to save space/performance, or just save all for simplicity in V1
      localStorage.setItem('erasure_services', JSON.stringify(services));
    }
  }, [services, isLoaded]);

  const renderStep = () => {
    switch (step) {
      case 'PROFILE':
        return <ProfileStep profile={profile} setProfile={setProfile} onNext={() => setStep('DISCOVERY')} />;
      case 'DISCOVERY':
        return <DiscoveryStep services={services} setServices={setServices} onNext={() => setStep('EXECUTION')} onBack={() => setStep('PROFILE')} />;
      case 'EXECUTION':
        return <ExecutionStep services={services} profile={profile} setServices={setServices} onBack={() => setStep('DISCOVERY')} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  const steps: WizardStep[] = ['PROFILE', 'DISCOVERY', 'EXECUTION'];
  const currentStepIndex = steps.indexOf(step);

  if (!isLoaded) return <div className="min-h-screen bg-paper-100 flex items-center justify-center font-serif text-ink-500">Loading Bureau Records...</div>;

  return (
    <div className="min-h-screen bg-paper-100 text-ink-900 font-sans selection:bg-stamp-200 selection:text-stamp-900">
      {/* Header - Letterhead Style */}
      <header className="border-b border-paper-300 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border-2 border-ink-900 flex items-center justify-center text-xl bg-ink-900 text-white shadow-sm">
              <i className="fa-solid fa-eraser"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink-900 font-serif leading-none">The Erasure Bureau</h1>
              <p className="text-xs text-ink-500 font-mono mt-1 tracking-widest uppercase">Automated Rights Enactment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if(confirm("This will clear all your data and progress. Are you sure?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-xs text-ink-400 hover:text-stamp-600 font-mono underline"
            >
              Reset Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Wizard Progress - Minimalist Line */}
        <div className="mb-12 border-b border-paper-300 pb-4">
          <div className="flex justify-between max-w-2xl mx-auto">
             {steps.map((s, idx) => {
               const isActive = idx === currentStepIndex;
               const isCompleted = idx < currentStepIndex;
               
               return (
                 <div key={s} className="flex flex-col items-center gap-2 relative">
                    <div className={`text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                       isActive ? 'text-stamp-700 scale-105' :
                       isCompleted ? 'text-ink-400' :
                       'text-ink-300'
                    }`}>
                       <span className={`w-6 h-6 flex items-center justify-center border rounded-full text-xs font-mono ${
                         isActive ? 'border-stamp-700 bg-stamp-50' : 
                         isCompleted ? 'border-ink-400 bg-paper-200' : 'border-ink-200'
                       }`}>
                         {isCompleted ? <i className="fa-solid fa-check"></i> : idx + 1}
                       </span>
                       <span className={`font-serif tracking-wide ${isActive ? 'underline decoration-2 underline-offset-4 decoration-stamp-200' : ''}`}>
                         {s}
                       </span>
                    </div>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[600px]">
          {renderStep()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="text-center py-12 text-ink-400 text-sm border-t border-paper-300 mt-12 bg-white">
        <p className="font-serif italic">"Privacy is a fundamental right, not a privilege."</p>
        <div className="mt-4 text-xs font-mono opacity-60">
          <p>Local Execution Only. No Server Upload.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;