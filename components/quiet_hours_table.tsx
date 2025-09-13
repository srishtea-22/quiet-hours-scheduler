import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

interface BlocksType {
  id: string;
  start_time: string;
  end_time: string;
  reminder_sent: boolean;
}

export function QuietHoursTable({ blocks }: { blocks: BlocksType[] }) {
  const now = new Date();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatus = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return "Upcoming";
    if (now > endDate) return "Completed";
    return "Ongoing";
  };

  const sortedBlocks = [...blocks].sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedBlocks.map((block) => (
          <TableRow key={block.id}>
            <TableCell>{formatDate(block.start_time)}</TableCell>
            <TableCell>{formatDate(block.end_time)}</TableCell>
            <TableCell>{getStatus(block.start_time, block.end_time)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
