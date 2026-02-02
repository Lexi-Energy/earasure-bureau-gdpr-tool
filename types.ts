export enum RequestStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  SKIPPED = 'SKIPPED',
}

// UNLOCKED: Changed from strict union to string to allow any country code from the DB
export type Region = string; 

export interface Service {
  id: string;
  name: string;
  // UNLOCKED: Changed to string to support all the new scraper categories
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
