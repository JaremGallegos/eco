
export interface DashboardStats {
  totalIncidents: number;
  pendingIncidents: number;
  incidentsByType: {
    agua: number;
    electricidad: number;
  };
}
