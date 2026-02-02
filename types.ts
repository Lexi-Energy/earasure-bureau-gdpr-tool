
export enum RequestStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  SKIPPED = 'SKIPPED',
}

export type Region = 'Global' | 'EU' | 'DE' | 'US' | 'UK';

export interface Service {
  id: string;
  name: string;
  category: 'Social' | 'Shopping' | 'Utility' | 'Data Broker' | 'Ad Tech' | 'Finance' | 'Travel' | 'Other' | 'Imported';
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
  includeSpeculative: boolean; // "Auf Verdacht"
  isEuCitizen: boolean; // Triggers GDPR Art 3 for non-EU companies
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
