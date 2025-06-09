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
          <TableHead className="text-center">Input</TableHead>
          <TableHead className="text-center">Factor</TableHead>
          <TableHead className="text-center">Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((h) => (
          <TableRow key={h._id}>
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
