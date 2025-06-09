import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableLoadingProps {
  loadingRows: number;
  loadingColumns: number;
}
const TableLoading = ({ loadingRows, loadingColumns }: TableLoadingProps) => {
  return (
    <Table>
      <TableBody>
        {[...Array(loadingRows)].map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: loadingColumns }).map((_, j) => (
              <TableCell key={j} className="text-center">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableLoading;
