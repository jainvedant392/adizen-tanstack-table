import { Table as TanStackTable } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { List, ChevronDown } from "lucide-react";

export const ColumnVisibilityToggle = <T,>({
  table,
}: {
  table: TanStackTable<T>;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="rounded-full">
        <Button variant="outline" size="sm">
          <List className="h-4 w-4" />
          Columns
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px] rounded-[1rem]">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize rounded-[1rem]"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.columnDef.header as string}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
