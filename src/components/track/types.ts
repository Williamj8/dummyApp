// src/types.ts
export interface RequestData {
  requestId: string;
  date: string;
  storeId: number;
  hours: string[];
  currentTotalPieceCount: number;
  modifiedCapacity: number;
  scheduledHeadCount: number;
  ScheduledModifiedCapacity: number;
  virtualHeadCount: number;
  modifiedVirtualHeadhount: number;
  reason: string[];
  other: null | string;
  changedBy: string;
  changedOn: string;
  completedOn: string | null;
  status: 'pending' | 'completed';
}