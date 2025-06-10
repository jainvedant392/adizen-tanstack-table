import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  Table as TanStackTable,
  type PaginationState,
  Row,
  Cell,
  Column,
  CellContext,
} from "@tanstack/react-table";

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Skeleton } from "./components/ui/skeleton";
import { Button } from "./components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "./components/ui/dropdown-menu";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";

// Icons
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download,
  RotateCw,
} from "lucide-react";
import { DateRangeFilter } from "./components/DateRangeFilter";
import {
  ViewSelector,
  SaveViewDialog,
  DeleteViewDialog,
} from "./components/Views";
import { TablePagination } from "./components/TablePagination";
import { ColumnVisibilityToggle } from "./components/ColumnVisibilityToggle";
import { GlobalFilter } from "./components/GlobalFilter";
import { ColumnFilter } from "./components/ColumnFilter";
import { EditableCellWithFormatting } from "./components/EditableCellWithFormatting";
import { SubRowsTable } from "./components/SubRowsTable";
import { ColumnConfig, ViewState, EnhancedDataTableProps } from "./types";

export function EnhancedDataTable<T>({
  data,
  columns,
  loading = false,
  skeletonRows = 5,
  emptyMessage = "No items found",
  onRowClick,
  enableGlobalSearch = false,
  enableColumnVisibility = false,
  enablePagination = false,
  enableCSVExport = false,
  enableDateRangeFilter = false,
  dateFilterField,
  globalSearchPlaceholder = "Search all columns...",
  initialPageSize = 50,
  pageSizeOptions = [10, 20, 30, 50, 100],
  enableCustomViews = false,
  viewStorageKey = "table-views",
  onViewChange,
  hasSubRows = false,
  getSubRows,
  subRowsColumns = [],
  expandedItems = new Set(),
  onToggleExpand,
  getRowId,
}: EnhancedDataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [customViews, setCustomViews] = useState<ViewState[]>([]);
  const [currentView, setCurrentView] = useState<ViewState | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [viewToDelete, setViewToDelete] = useState<ViewState | null>(null);
  const [dateRange, setDateRange] = useState("all");
  const [filteredData, setFilteredData] = useState(data);

  // Export options
  const exportCurrentPage = () => {
    const visibleColumns = table
      .getVisibleFlatColumns()
      .filter((col) => col.id !== "select");
    const rows = table.getRowModel().rows; // Current page only

    exportRows(rows, visibleColumns, "current-page");
  };

  const exportAllFiltered = () => {
    const visibleColumns = table
      .getVisibleFlatColumns()
      .filter((col) => col.id !== "select");
    const rows = table.getFilteredRowModel().rows; // All filtered data

    exportRows(rows, visibleColumns, "all-filtered");
  };

  const exportRows = (
    rows: Row<T>[],
    visibleColumns: Column<T, unknown>[],
    type: string
  ) => {
    const headers = visibleColumns.map((column) => {
      const header = column.columnDef.header;
      return typeof header === "string" ? header : column.id;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        visibleColumns
          .map((column) => {
            const cellValue = row.getValue(column.id);
            let cleanValue = "";

            if (cellValue === null || cellValue === undefined) {
              cleanValue = "";
            } else {
              cleanValue = String(cellValue)
                .replace(/<[^>]*>/g, "")
                .replace(/"/g, '""')
                .trim();
            }

            if (
              cleanValue.includes(",") ||
              cleanValue.includes("\n") ||
              cleanValue.includes('"')
            ) {
              return `"${cleanValue}"`;
            }

            return cleanValue;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `table-export-${type}-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View management functions
  const saveViewsToStorage = (views: ViewState[]) => {
    if (enableCustomViews && viewStorageKey) {
      localStorage.setItem(viewStorageKey, JSON.stringify(views));
    }
  };

  const loadViewsFromStorage = useCallback((): ViewState[] => {
    if (!enableCustomViews || !viewStorageKey) return [];

    try {
      const stored = localStorage.getItem(viewStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading views from storage:", error);
      return [];
    }
  }, [enableCustomViews, viewStorageKey]);

  const saveCurrentAsView = (viewName: string, isDefault = false) => {
    const newView: ViewState = {
      id: `view-${Date.now()}`,
      name: viewName,
      columnVisibility: table.getState().columnVisibility,
      pageSize: table.getState().pagination.pageSize,
      isDefault,
    };

    let updatedViews = [...customViews];

    // Remove existing default if setting new default
    if (isDefault) {
      updatedViews = updatedViews.map((v) => ({ ...v, isDefault: false }));
    }

    updatedViews.push(newView);
    setCustomViews(updatedViews);
    saveViewsToStorage(updatedViews);
    setCurrentView(newView);

    if (onViewChange) {
      onViewChange(newView);
    }
  };

  const deleteView = (viewId: string) => {
    const viewToDelete = customViews.find((v) => v.id === viewId);
    if (viewToDelete) {
      setViewToDelete(viewToDelete);
    }
  };

  const confirmDeleteView = () => {
    if (viewToDelete) {
      const updatedViews = customViews.filter((v) => v.id !== viewToDelete.id);
      setCustomViews(updatedViews);
      saveViewsToStorage(updatedViews);

      if (currentView?.id === viewToDelete.id) {
        setCurrentView(null);
        resetToDefault();
      }

      setViewToDelete(null);
    }
  };

  const resetToDefault = () => {
    const defaultVisibility: Record<string, boolean> = {};
    columns.forEach((col) => {
      defaultVisibility[col.id] = true;
    });

    table.setColumnVisibility(defaultVisibility);
    table.setPageSize(initialPageSize);
    setCurrentView(null);
  };

  // Date range filtering logic
  const filterDataByDateRange = useCallback(
    (data: T[], range: string, dateField: keyof T) => {
      if (range === "all") return data;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      let startDate: Date;

      switch (range) {
        case "today":
          startDate = today;
          break;
        case "last_3_days":
          startDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case "last_week":
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "last_15_days":
          startDate = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
          break;
        case "last_month":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          break;
        case "last_6_months":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 6,
            now.getDate()
          );
          break;
        case "last_year":
          startDate = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          );
          break;
        default:
          return data;
      }

      return data.filter((item: T) => {
        const itemDate = item[dateField] as unknown;
        if (!itemDate) return false;

        try {
          const date = new Date(itemDate as string);
          return date >= startDate;
        } catch (error) {
          return false;
        }
      });
    },
    []
  );

  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const filtered = filterDataByDateRange(
      data,
      range,
      dateFilterField as keyof T
    );
    setFilteredData(filtered);
  };

  // Filter data when date range or original data changes
  useEffect(() => {
    const filtered = filterDataByDateRange(
      data,
      dateRange,
      dateFilterField as keyof T
    );
    setFilteredData(filtered);
  }, [data, dateRange, filterDataByDateRange, dateFilterField]);

  // Convert our column config to TanStack columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tanstackColumns = useMemo<ColumnDef<T, any>[]>(() => {
    return columns.map((col) => ({
      id: col.id,
      header: col.header,
      accessorKey: col.accessorKey,
      accessorFn: col.accessorFn,
      cell: col.enableEditing
        ? (props: CellContext<T, unknown>) => (
            <EditableCellWithFormatting {...props} columnConfig={col} />
          )
        : col.cell || ((ctx: CellContext<T, unknown>) => ctx.getValue()),
      enableSorting: col.enableSorting ?? false,
      enableColumnFilter: col.enableColumnFilter ?? false,
      enableGlobalFilter: col.enableGlobalFilter ?? false,
      size: col.size,
      meta: {
        columnConfig: col,
        filterType: col.filterType,
        filterOptions: col.filterOptions,
        skeleton: col.skeleton,
        enableEditing: col.enableEditing,
        editType: col.editType,
        editOptions: col.editOptions,
        onCellEdit: col.onCellEdit,
      },
    }));
  }, [columns]);

  const table = useReactTable({
    data: filteredData,
    columns: tanstackColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
    state: {
      globalFilter,
      ...(enablePagination && { pagination }),
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    ...(enablePagination && {
      onPaginationChange: setPagination,
    }),
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: "includesString",
  });

  const applyView = useCallback(
    (view: ViewState) => {
      table.setColumnVisibility(view.columnVisibility);
      table.setPageSize(view.pageSize);
      setCurrentView(view);

      if (onViewChange) {
        onViewChange(view);
      }
    },
    [table, onViewChange]
  );

  useEffect(() => {
    if (enableCustomViews) {
      const views = loadViewsFromStorage();
      setCustomViews(views);

      // Apply default view if exists
      const defaultView = views.find((v) => v.isDefault);
      if (defaultView) {
        // Delay application to ensure table is ready
        setTimeout(() => applyView(defaultView), 100);
      }
    }
  }, [enableCustomViews, viewStorageKey, loadViewsFromStorage, applyView]);

  const renderSortIcon = (column: Column<T, unknown>) => {
    if (!column.getCanSort()) return null;

    const sorted = column.getIsSorted();
    if (sorted === "asc") {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }
    if (sorted === "desc") {
      return <ChevronDown className="ml-2 h-4 w-4" />;
    }
    return <ChevronsUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {enableGlobalSearch && (
            <GlobalFilter
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              placeholder={globalSearchPlaceholder}
            />
          )}
          {enableDateRangeFilter && (
            <DateRangeFilter
              onDateRangeChange={handleDateRangeChange}
              currentRange={dateRange}
            />
          )}
        </div>
        <div className="flex items-center space-x-4">
          {enableCustomViews && (
            <div className="flex items-center rounded-full">
              <ViewSelector
                views={customViews}
                currentView={currentView}
                onViewSelect={applyView}
                onDeleteView={deleteView}
              />
              <SaveViewDialog onSaveView={saveCurrentAsView} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button variant="ghost" size="sm" onClick={resetToDefault}>
                      <RotateCw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset To Default View</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {enableColumnVisibility && (
            <ColumnVisibilityToggle table={table as TanStackTable<T>} />
          )}
          {enableCSVExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="rounded-full">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  Export CSV
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-[1rem]">
                <DropdownMenuItem
                  onClick={exportCurrentPage}
                  className="rounded-[1rem]"
                >
                  Export Current Page ({table.getRowModel().rows.length} rows)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={exportAllFiltered}
                  className="rounded-[1rem]"
                >
                  Export All Filtered ({table.getFilteredRowModel().rows.length}{" "}
                  rows)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[1rem] shadow-[0_10px_20px_rgba(0,0,0,0.15)] overflow-x-auto px-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnConfig<T>;
                  return (
                    <TableHead
                      key={header.id}
                      className="text-gray-600 pt-6 pb-4"
                      style={{ width: header.getSize() }}
                    >
                      <div className="space-y-1">
                        {/* Header with sorting */}
                        <div
                          className={`flex items-center font-semibold text-md ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {renderSortIcon(header.column)}
                        </div>

                        {/* Column Filter */}
                        {header.column.getCanFilter() && meta?.filterType && (
                          <div className="mt-1">
                            <ColumnFilter
                              column={header.column}
                              filterType={meta.filterType}
                              filterOptions={meta.filterOptions}
                            />
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="even:bg-gray-100">
                  {table.getVisibleFlatColumns().map((column, colIndex) => {
                    const meta = column.columnDef.meta as ColumnConfig<T>;
                    return (
                      <TableCell key={colIndex}>
                        <Skeleton
                          className={`h-${meta?.skeleton?.height || "6"} w-${
                            meta?.skeleton?.width || "[200px]"
                          }`}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleFlatColumns().length}
                  className="text-center py-16 text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              table.getRowModel().rows.map((row: any, index) => {
                const rowData = row.original;
                const rowId = getRowId ? getRowId(rowData) : row.index;
                const isExpanded = hasSubRows && expandedItems.has(rowId);
                const subRows =
                  hasSubRows && getSubRows ? getSubRows(rowData) : [];

                return (
                  <React.Fragment key={row.id}>
                    {/* Main row */}
                    <TableRow
                      className={`transition-colors text-md ${
                        onRowClick ? "cursor-pointer" : ""
                      } ${
                        isExpanded
                          ? "bg-blue-50"
                          : index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      } hover:bg-blue-50`}
                      onClick={() => {
                        // Handle expansion toggle AND row click
                        if (
                          hasSubRows &&
                          onToggleExpand &&
                          rowId !== undefined
                        ) {
                          onToggleExpand(rowId);
                        }
                        if (onRowClick) {
                          onRowClick(row.original);
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Sub-rows */}
                    {hasSubRows &&
                      getSubRows &&
                      isExpanded &&
                      subRows.length > 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={table.getVisibleFlatColumns().length}
                            className="p-0"
                          >
                            <SubRowsTable
                              subTasks={subRows}
                              subColumns={subRowsColumns}
                              parentIndex={index}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && !loading && (
        <TablePagination
          table={table as TanStackTable<T>}
          pageSizeOptions={pageSizeOptions}
        />
      )}

      <DeleteViewDialog
        viewToDelete={viewToDelete}
        onConfirm={confirmDeleteView}
        onCancel={() => setViewToDelete(null)}
      />
    </div>
  );
}
