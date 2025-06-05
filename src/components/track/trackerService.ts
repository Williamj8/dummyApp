// src/services/dataService.ts

interface RequestData {
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

const mockData: RequestData[] = [
    {
        "requestId": "0987654567890987654567890",
        "date": "2025-01-11",
        "storeId": 1,
        "hours": ["0100", "0000"],
        "currentTotalPieceCount": 11,
        "modifiedCapacity": 22,
        "scheduledHeadCount": 1,
        "ScheduledModifiedCapacity": 2,
        "virtualHeadCount": 4,
        "modifiedVirtualHeadhount": 1,
        "reason": ["Reason is nothing"],
        "other": null,
        "changedBy": "",
        "changedOn": "2025-01-01 05:00:10.06",
        "completedOn": null,
        "status": "pending"
    },
    {
        "requestId": "098765456722287654567890",
        "date": "2025-05-12",
        "storeId": 1,
        "hours": ["0200", "0100"],
        "currentTotalPieceCount": 21,
        "modifiedCapacity": 2,
        "scheduledHeadCount": 1,
        "ScheduledModifiedCapacity": 24,
        "virtualHeadCount": 4,
        "modifiedVirtualHeadhount": 1,
        "reason": ["Reason is nothing"],
        "other": null,
        "changedBy": "Yo YO",
        "changedOn": "2025-01-01 05:00:10.06",
        "completedOn": "2025-02-02 07:10:40.09",
        "status": "completed"
    }
];

export const fetchData = async (): Promise<RequestData[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockData);
        }, 500);
    });
};