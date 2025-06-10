import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export const GlobalFilter = ({
  globalFilter,
  setGlobalFilter,
  placeholder = "Search all columns...",
}: {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  placeholder?: string;
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={globalFilter || ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="pl-10 max-w-sm rounded-full"
      />
      {globalFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={() => setGlobalFilter("")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
