import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

interface BlocksType {
    id: string;
    start_time: string;
    end_time: string;
    reminder_sent: boolean;
}

export function QuietHoursTable({ blocks }: { blocks: BlocksType[] }) {
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
        {blocks.map((block) => (
          <TableRow key={block.id}>
            <TableCell>{new Date(block.start_time).toLocaleString()}</TableCell>
            <TableCell>{new Date(block.end_time).toLocaleString()}</TableCell>
            <TableCell>
              {block.reminder_sent ? "Reminder Sent" : "Pending"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
