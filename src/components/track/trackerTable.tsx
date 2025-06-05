// src/components/TrackerTable.tsx
import { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
    Column
} from '@tanstack/react-table';

import { RequestData } from './types';
import { fetchData } from './trackerService';

const TrackerTable = () => {
    const [data, setData] = useState<RequestData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchData();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const columns: ColumnDef<RequestData>[] = [
        {
            header: 'Request ID',
            accessorKey: 'requestId',
            cell: info => <span className="text-blue-600">{info.getValue() as string}</span>
        },
        {
            header: 'Date',
            accessorKey: 'date'
        },
        {
            header: 'Store ID',
            accessorKey: 'storeId'
        },
        {
            header: 'Hours',
            accessorKey: 'hours',
            cell: info => (info.getValue() as string[]).join(' - ')
        },
        {
            header: 'Piece Count',
            accessorKey: 'currentTotalPieceCount'
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: info => {
                const status = info.getValue() as 'pending' | 'completed';
                const color = status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800';
                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
                        {status}
                    </span>
                );
            }
        },
        {
            header: 'Changed By',
            accessorKey: 'changedBy'
        },
        {
            header: 'Changed On',
            accessorKey: 'changedOn'
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    if (loading) {
        return <div className="p-4 text-center">Loading data...</div>;
    }

    return (
        <div className="p-4">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TrackerTable;