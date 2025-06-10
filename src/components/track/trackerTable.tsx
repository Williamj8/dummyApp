import { useState, useEffect } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender,
  ColumnDef,
  Table
} from '@tanstack/react-table';
import { fetchData } from './trackerService';
import './styles.css';

interface RequestData {
  storeId: number;
  date: string;
  hours: string[];
  currentTotalPieceCount: number;
  status: 'pending' | 'completed';
  changedBy: string;
  changedOn: string;
}

interface ReusableTableProps<TData> {
  table: Table<TData>;
  loading: boolean;
}

export const ReusableTable = <TData,>({ table, loading }: ReusableTableProps<TData>) => {
  if (loading) return <div className="loading-indicator">Loading data...</div>;

  return (
    <div className="table-container">
      <table className="reusable-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} style={{ width: header.getSize() }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, cellIndex) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const useRequestDataTable = () => {
  const [data, setData] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const loadData = async () => {
      try {
        const result = await fetchData();
        // Map only the fields we need
        const mappedData = result.map(item => ({
          storeId: item.storeId,
          date: item.date,
          hours: item.hours,
          currentTotalPieceCount: item.currentTotalPieceCount,
          status: item.status,
          changedBy: item.changedBy,
          changedOn: item.changedOn
        }));
        setData(mappedData);
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
      header: 'Store ID',
      accessorKey: 'storeId',
      size: 100
    },
    {
      header: 'Date',
      accessorKey: 'date',
      size: 120
    },
    {
      header: 'Hours',
      accessorKey: 'hours',
      cell: info => (info.getValue() as string[]).join(' - '),
      size: 120
    },
    {
      header: 'Piece Count',
      accessorKey: 'currentTotalPieceCount',
      size: 120
    },
    {
      header: 'Status',
      accessorKey: 'status',
      size: 100
    },
    {
      header: 'Changed By',
      accessorKey: 'changedBy',
      size: 150
    },
    {
      header: 'Changed On',
      accessorKey: 'changedOn',
      size: 180
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return { table, loading };
};

export const RequestDataTable = () => {
  const { table, loading } = useRequestDataTable();
  return <ReusableTable<RequestData> table={table} loading={loading} />;
};