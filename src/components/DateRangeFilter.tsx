import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

export const DateRangeFilter = ({
  onDateRangeChange,
  currentRange,
}: {
  onDateRangeChange: (range: string) => void;
  currentRange: string;
}) => {
  const dateRangeOptions = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Last 3 Days", value: "last_3_days" },
    { label: "Last Week", value: "last_week" },
    { label: "Last 15 Days", value: "last_15_days" },
    { label: "Last Month", value: "last_month" },
    { label: "Last 6 Months", value: "last_6_months" },
    { label: "Last Year", value: "last_year" },
  ];

  return (
    <Select value={currentRange} onValueChange={onDateRangeChange}>
      <SelectTrigger className="w-[150px] rounded-full">
        <SelectValue placeholder="Date Range" />
      </SelectTrigger>
      <SelectContent>
        {dateRangeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
