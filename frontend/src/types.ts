export interface FellowMaster {
  trainee: string;
  total_patients: number;
  asa1: number;
  asa2: number;
  asa3: number;
  asa4: number;
  airway_surgery: number;
  cardiac_bypass: number;
  cardiac_no_bypass: number;
  craniofacial: number;
  neurosurgery: number;
  spinal: number;
  direct_laryngoscopy: number;
  flexible_bronchoscopy: number;
  natural_airway: number;
  supraglottic_airway: number;
  video_laryngoscopy: number;
  neonatal_intestinal: number;
  neonatal_surgical: number;
  gaps_count: number;
  status: 'On Track' | 'Not Meeting';
}

export interface CategorySummary {
  category: string;
  label: string;
  pct: number;
  met: number;
  total: number;
}

export interface FellowDetail {
  trainee: string;
  total_patients: number;
  requirements: Record<string, RequirementResult>;
  gaps_count: number;
  status: 'On Track' | 'Not Meeting';
}

export interface RequirementResult {
  actual: number;
  threshold: number;
  met: boolean;
  gap: number;
}
