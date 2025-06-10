import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Input } from "./ui/input";
import { ColumnFilterProps } from "../types";

export function ColumnFilter<T>({
  column,
  filterType,
  filterOptions,
}: ColumnFilterProps<T>) {
  const columnFilterValue = column.getFilterValue();

  if (filterType === "select" && filterOptions) {
    return (
      <Select
        value={(columnFilterValue as string) || "all"}
        onValueChange={(value) =>
          column.setFilterValue(value === "all" ? "" : value)
        }
      >
        <SelectTrigger className="h-8 rounded-full">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent className="rounded-[1rem]">
          <SelectItem value="all" className="rounded-[1rem]">
            All
          </SelectItem>
          {filterOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              className="rounded-[1rem]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={filterType === "date" ? "date" : "text"}
      placeholder={`Filter...`}
      value={(columnFilterValue as string) || ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      className="h-8 rounded-full"
    />
  );
}
