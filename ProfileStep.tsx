import React from 'react';
import { UserProfile, TemplateStyle } from './types';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  onNext: () => void;
}

const ProfileStep: React.FC<Props> = ({ profile, setProfile, onNext }) => {
  const handleChange = (field: keyof UserProfile, value: string | boolean | TemplateStyle) => {
    setProfile({ ...profile, [field]: value });
  };

  const isValid = profile.fullName.trim() !== '' && profile.email.trim() !== '';

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      
      {/* Disclaimer / Info Box */}
      <div className="bg-paper-50 border-l-4 border-ink-400 p-4 mb-8 text-sm text-ink-600 font-serif leading-relaxed shadow-sm">
        <p className="mb-2">
          <strong><i className="fa-solid fa-scale-balanced mr-1"></i> Notice:</strong> This tool automates the creation of GDPR Article 17 ("Right to Erasure") requests. 
        </p>
        <p>
          Data is processed <strong>locally in your browser</strong>. We do not store your information. 
          This tool is provided "as is" without legal warranty. We generate the drafts; you must send them.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 md:p-12 shadow-sm border border-paper-300 relative">
        {/* Decorative corner mark */}
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-paper-200 border-r-transparent"></div>
        
        <h2 className="text-3xl font-serif font-bold text-ink-900 mb-2 border-b-2 border-ink-900 pb-4">
          Identity Declaration
        </h2>
        <p className="text-ink-600 mb-8 font-serif italic mt-4 text-lg">
          Please provide the details to be inserted into your legal requests.
        </p>

        <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
             <div className="md:col-span-2 bg-paper-50 p-6 border border-paper-200">
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-widest mb-3">Request Language</label>
                <div className="flex gap-4">
                  <label className={`flex-1 border-2 p-4 cursor-pointer transition-colors flex items-center justify-center gap-3 ${profile.language === 'EN' ? 'border-ink-900 bg-white text-ink-900' : 'border-paper-300 text-ink-400 hover:border-ink-300'}`}>
                    <input 
                      type="radio" 
                      name="lang" 
                      value="EN" 
                      checked={profile.language === 'EN'}
                      onChange={() => handleChange('language', 'EN')}
                      className="hidden"
                    />
                    <span className="font-serif text-lg">English</span>
                    <i className={`fa-solid fa-check ${profile.language === 'EN' ? 'opacity-100' : 'opacity-0'}`}></i>
                  </label>
                  <label className={`flex-1 border-2 p-4 cursor-pointer transition-colors flex items-center justify-center gap-3 ${profile.language === 'DE' ? 'border-ink-900 bg-white text-ink-900' : 'border-paper-300 text-ink-400 hover:border-ink-300'}`}>
                    <input 
                      type="radio" 
                      name="lang" 
                      value="DE" 
                      checked={profile.language === 'DE'}
                      onChange={() => handleChange('language', 'DE')}
                      className="hidden"
                    />
                    <span className="font-serif text-lg">Deutsch</span>
                    <i className={`fa-solid fa-check ${profile.language === 'DE' ? 'opacity-100' : 'opacity-0'}`}></i>
                  </label>
                </div>
              </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-ink-900 mb-1 font-mono">FULL NAME <span className="text-stamp-600">*</span></label>
                <input 
                type="text" 
                value={profile.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full bg-transparent border-b-2 border-paper-300 focus:border-ink-900 py-2 text-xl text-ink-900 outline-none transition-colors font-serif placeholder:font-sans placeholder:text-paper-300"
                placeholder="e.g. John Doe"
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-ink-900 mb-1 font-mono">EMAIL ADDRESS <span className="text-stamp-600">*</span></label>
                <input 
                type="email" 
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-transparent border-b-2 border-paper-300 focus:border-ink-900 py-2 text-xl text-ink-900 outline-none transition-colors font-mono placeholder:font-sans placeholder:text-paper-300"
                placeholder="e.g. john@example.com"
                />
                <p className="text-xs text-ink-400 mt-2 font-mono">Note: Companies will reply to this address.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink-500 mb-1 font-mono">ADDRESS (OPTIONAL)</label>
              <input 
                type="text" 
                value={profile.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-transparent border-b-2 border-paper-300 focus:border-ink-500 py-2 text-lg text-ink-900 outline-none transition-colors font-serif"
                placeholder="Street, City, Zip"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink-500 mb-1 font-mono">PHONE (OPTIONAL)</label>
              <input 
                type="text" 
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-transparent border-b-2 border-paper-300 focus:border-ink-500 py-2 text-lg text-ink-900 outline-none transition-colors font-mono"
                placeholder="+1 555 0123"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-paper-200 space-y-4">
             {/* EU Citizen Toggle */}
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className={`mt-1 w-6 h-6 border-2 flex items-center justify-center transition-colors ${profile.isEuCitizen ? 'bg-indigo-900 border-indigo-900 text-white' : 'border-paper-400 bg-white group-hover:border-ink-400'}`}>
                <input 
                  type="checkbox" 
                  checked={profile.isEuCitizen}
                  onChange={(e) => handleChange('isEuCitizen', e.target.checked)}
                  className="hidden"
                />
                {profile.isEuCitizen && <i className="fa-solid fa-check text-xs"></i>}
              </div>
              <div>
                <span className="text-ink-900 font-bold font-serif text-lg">I am an EU Citizen / Resident</span>
                <p className="text-sm text-ink-500 mt-1 leading-relaxed">
                  Adds "Article 3 (Territorial Scope)" clauses to requests sent to US companies, asserting your GDPR rights globally.
                </p>
              </div>
            </label>
            
            {/* Speculative Toggle */}
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className={`mt-1 w-6 h-6 border-2 flex items-center justify-center transition-colors ${profile.includeSpeculative ? 'bg-stamp-600 border-stamp-600 text-white' : 'border-paper-400 bg-white group-hover:border-ink-400'}`}>
                <input 
                  type="checkbox" 
                  checked={profile.includeSpeculative}
                  onChange={(e) => handleChange('includeSpeculative', e.target.checked)}
                  className="hidden"
                />
                {profile.includeSpeculative && <i className="fa-solid fa-check text-xs"></i>}
              </div>
              <div>
                <span className="text-ink-900 font-bold font-serif text-lg">Enable "Speculative Mode"</span>
                <p className="text-sm text-ink-500 mt-1 leading-relaxed">
                  Adds a clause: "If you have data on me...". Essential for Data Brokers who trade your data without you creating an account.
                </p>
              </div>
            </label>

            {/* Template Style */}
            <div className="mt-4 pt-4 border-t border-paper-200">
               <label className="block text-xs font-bold text-ink-500 uppercase tracking-widest mb-3">Email Tone</label>
               <select 
                  value={profile.templateStyle || 'SIMPLE'} 
                  onChange={(e) => handleChange('templateStyle', e.target.value as TemplateStyle)}
                  className="w-full bg-paper-50 border border-paper-300 p-3 text-ink-900 font-serif"
               >
                  <option value="SIMPLE">Personal (USP) - Human & Direct</option>
                  <option value="LEGAL">Standard Legal - Professional & Firm</option>
                  <option value="AGGRESSIVE">Aggressive - Data Brokers / "Scorched Earth"</option>
               </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={onNext}
          disabled={!isValid}
          className={`px-8 py-4 font-bold tracking-wider uppercase transition-all shadow-md ${
            isValid 
              ? 'bg-ink-900 text-white hover:bg-black hover:shadow-lg transform hover:-translate-y-1' 
              : 'bg-paper-300 text-ink-400 cursor-not-allowed'
          }`}
        >
          Proceed to Discovery <i className="fa-solid fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
};

export default ProfileStep;