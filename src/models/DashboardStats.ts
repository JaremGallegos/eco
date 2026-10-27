
export interface DashboardStats {
  totalIncidents: number;
  pendingIncidents: number;
  incidentsByType: {
    AGUA: number;
    LUZ: number;
  };
}
