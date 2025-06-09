import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CalculationLogResponse } from '@/types';

interface CalculationTableProps {
  history: CalculationLogResponse['data'];
}

const CalculationTable = ({ history }: CalculationTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">No.</TableHead>
          <TableHead className="text-center w-[50px]">Input</TableHead>
          <TableHead className="text-center w-[50px]">Factor</TableHead>
          <TableHead className="text-center w-[50px]">Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((h, index) => (
          <TableRow key={h._id}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="text-center">{h.number}</TableCell>
            <TableCell className="text-center">{h.factor}</TableCell>
            <TableCell className="text-center">{h.number * h.factor}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CalculationTable;
