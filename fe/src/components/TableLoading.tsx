import { TableBody, TableCell, TableRow } from '@/components/ui/table';

interface TableLoadingProps {
  loadingRows: number;
  loadingColumns: number;
}
const TableLoading = ({ loadingRows, loadingColumns }: TableLoadingProps) => {
  return (
    <TableBody>
      {[...Array(loadingRows)].map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: loadingColumns }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};

export default TableLoading;
