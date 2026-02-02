import { Service, RequestStatus } from "./types";
// @ts-ignore
import GENERATED_DB from "./generated-services.json";

// 1. The "High Priority" Manual List (Your Curated Targets)
const MANUAL_SERVICES: Service[] = [
  // =========================================================================
  // PASTE THE CONTENT FROM MY PREVIOUS MESSAGE (THE 250+ LIST) HERE
  // =========================================================================
  // If you lost it, I can paste it again. 
  // But strictly, you want the high-confidence manual list here.
  // Below is a placeholder for the structure:
  { id: 'spokeo', name: 'Spokeo', category: 'Data Broker', region: 'US', email: 'privacy@spokeo.com', confidence: 'High', selected: false, status: RequestStatus.PENDING },
  { id: 'acxiom', name: 'Acxiom', category: 'Data Broker', region: 'Global', email: 'consumeradvo@acxiom.com', confidence: 'Medium', selected: false, status: RequestStatus.PENDING },
  // ... (Keep your existing manual entries) ...
];

// 2. The Merger Function
const mergeServices = (): Service[] => {
  // Create a Set of names from the manual list to prevent duplicates
  const manualIds = new Set(MANUAL_SERVICES.map(s => s.name.toLowerCase()));

  // Clean up the generated list
  const cleanGenerated = (GENERATED_DB as any[]).map((s: any) => ({
    id: s.id,
    name: s.name,
    category: s.category || 'Other',
    region: s.region || 'Global',
    email: s.email,
    confidence: 'High', // Datenanfragen data is community verified
    selected: false,
    status: RequestStatus.PENDING,
    notes: s.notes
  })).filter(s => {
    // Filter out duplicates (if we already have it in manual list)
    return !manualIds.has(s.name.toLowerCase());
  });

  console.log(`Loaded ${MANUAL_SERVICES.length} manual and ${cleanGenerated.length} generated targets.`);

  // Combine them: Manual first (higher priority), then generated
  return [...MANUAL_SERVICES, ...cleanGenerated];
};

export const INITIAL_SERVICES: Service[] = mergeServices();