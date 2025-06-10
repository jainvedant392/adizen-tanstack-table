import { Column } from "@tanstack/react-table";

export type SubTaskCellContext<T> = {
  getValue: () => unknown;
  row: { original: T };
};

export interface ColumnConfig<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => string | number | boolean | Date | React.ReactNode;
  cell?: (ctx: SubTaskCellContext<T>) => React.ReactNode;
  enableSorting?: boolean;
  enableColumnFilter?: boolean;
  filterType?: "text" | "select" | "date" | "number";
  filterOptions?: FilterOption[];
  enableGlobalFilter?: boolean;
  enableEditing?: boolean;
  editType?: "text" | "select" | "date" | "number";
  editOptions?: FilterOption[];
  onCellEdit?: (
    value: string | number | boolean | Date,
    rowData: T
  ) => Promise<void> | void;
  size?: number;
  skeleton?: {
    width?: string;
    height?: string;
  };
}

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface ColumnFilterProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<T, any>;
  filterType?: string;
  filterOptions?: FilterOption[];
}

export interface ViewState {
  id: string;
  name: string;
  columnVisibility: Record<string, boolean>;
  pageSize: number;
  isDefault?: boolean;
}

export interface EnhancedDataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  loading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  selectedRowId?: number;
  enableGlobalSearch?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  enableCSVExport?: boolean;
  enableDateRangeFilter: boolean;
  dateFilterField?: string;
  globalSearchPlaceholder?: string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  enableCustomViews?: boolean;
  viewStorageKey?: string;
  onViewChange?: (view: ViewState) => void;
  hasSubRows?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSubRows?: (item: T) => any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subRowsColumns?: ColumnConfig<any>[];
  expandedItems?: Set<number>;
  onToggleExpand?: (id: number) => void;
  getRowId?: (row: T) => number | string;
}
