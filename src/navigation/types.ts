
export type RootStackParamList = {
  '(tabs)': undefined;
  'report/create': { type?: 'agua' | 'luz' } | undefined;
  'report/evidence': undefined;
  'report/[id]': { id: string };
  'report/feedback': { reportId: string };
  'report/escalation': { reportId: string };
  'history': undefined;
  'map': undefined;
  'modal': undefined;
};

export type TabParamList = {
  index: undefined;
  explore: undefined;
};


export const Routes = {
  TABS: '(tabs)',
  DASHBOARD: '(tabs)/',
  EXPLORE: '(tabs)/explore',
  REPORT_CREATE: 'report/create',
  REPORT_EVIDENCE: 'report/evidence',
  REPORT_DETAIL: (id: string) => `report/${id}`,
  REPORT_FEEDBACK: 'report/feedback',
  REPORT_ESCALATION: 'report/escalation',
  HISTORY: 'history',
  MAP: 'map',
  MODAL: 'modal',
} as const;

