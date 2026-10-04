import { apiRequest } from '../../api/client';

export interface ContentVersion {
  schemaVersion: 1;
  revision: number;
  releaseId: string | null;
  updatedAt: string | null;
}

export function getContentVersion() {
  return apiRequest<ContentVersion>('/api/v1/content-version');
}
