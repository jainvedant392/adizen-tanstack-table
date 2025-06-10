import { ColumnConfig } from "../types";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "./ui/table";

function renderSubTaskCell<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subTask: any,
  column: ColumnConfig<T>,
  colIndex: number
) {
  // First column with └ symbol and task name
  if (colIndex === 0 && subTask.task) {
    return (
      <div className="flex items-center">
        <div className="w-6 text-gray-400">└</div>
        <div className="font-medium text-gray-700">{subTask.task.name}</div>
      </div>
    );
  }

  // Use custom cell renderer if provided
  if (column.cell) {
    return column.cell({
      getValue: () => subTask[column.accessorKey || ""],
      row: { original: subTask },
    });
  }

  // Function accessor
  if (typeof column.accessorFn === "function") {
    return column.accessorFn(subTask);
  }

  // Date formatting for accessorKey
  if (column.accessorKey) {
    const value = subTask[column.accessorKey];
    if (column.header.includes("Date") && value && typeof value === "string") {
      try {
        return new Date(value).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch (error) {
        return value;
      }
    }
    return value || "-";
  }

  return "-";
}

export function SubRowsTable<T>({
  subTasks,
  subColumns,
  parentIndex,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subTasks: any[];
  subColumns: ColumnConfig<T>[];
  parentIndex: number;
}) {
  return (
    <div className="border-l-2 border-blue-400 ml-4 pl-4">
      <Table>
        <TableHeader>
          <TableRow>
            {subColumns.map((column, colIndex) => (
              <TableHead
                key={colIndex}
                className="bg-gray-100 text-gray-600 text-xs py-2"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {subTasks.map((subTask, subIndex) => (
            <TableRow
              key={`${parentIndex}-sub-${subIndex}`}
              className="bg-gray-50 even:bg-blue-50 border-b border-gray-100 hover:bg-gray-100"
            >
              {subColumns.map((column, colIndex) => (
                <TableCell
                  key={`${parentIndex}-sub-${subIndex}-col-${colIndex}`}
                  className="py-2"
                >
                  {renderSubTaskCell(subTask, column, colIndex)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
