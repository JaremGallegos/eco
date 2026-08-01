import { router } from 'expo-router';
import { Routes } from './types';

export function navigateToCreateReport(type?: 'agua' | 'luz') {
  if (type) {
    router.push(`${Routes.REPORT_CREATE}?type=${type}` as any);
  } else {
    router.push(Routes.REPORT_CREATE as any);
  }
}

export function navigateToLocationMap() {
  router.push('report/location-map' as any);
}

export function navigateToEvidence() {
  router.push(Routes.REPORT_EVIDENCE as any);
}

export function navigateToReportDetail(reportId: number) {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.push(`/report/${reportId}`);
}

export function navigateToFeedback(reportId: number) {
  router.push({
    pathname: '/report/feedback',
    params: { reportId: reportId.toString() },
  } as any);
}

export function navigateToEscalation(reportId: number) {
  router.push({
    pathname: '/report/escalation',
    params: { id: reportId.toString() },
  } as any);
}

export function navigateToHistory() {
  router.push(Routes.HISTORY as any);
}

export function navigateToMap() {
  router.push(Routes.DASHBOARD as any);
}

export function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.push(Routes.DASHBOARD as any);
  }
}
