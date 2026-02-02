export enum RequestStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  SKIPPED = 'SKIPPED',
}

// Changed to string to allow specific countries (e.g. 'FR', 'AT') if you update your DB script later
export type Region = string; 

export interface Service {
  id: string;
  name: string;
  // Changed to string so imported categories don't break the app
  category: string; 
  region: Region;
  email?: string;
  confidence?: 'High' | 'Medium' | 'Low' | 'Manual';
  selected: boolean;
  status: RequestStatus;
  notes?: string;
}

export type TemplateStyle = 'SIMPLE' | 'LEGAL' | 'AGGRESSIVE';

export interface UserProfile {
  fullName: string;
  email: string;
  address?: string;
  phone?: string;
  includeSpeculative: boolean; 
  isEuCitizen: boolean; 
  templateStyle: TemplateStyle;
  language: 'EN' | 'DE';
}

export interface GdprTemplateVars {
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  date: string;
}

export type WizardStep = 'PROFILE' | 'DISCOVERY' | 'REVIEW' | 'EXECUTION';
