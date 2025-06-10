import { useState, useEffect } from "react";
import { CellContext } from "@tanstack/react-table";
import { ColumnConfig, FilterOption } from "../types";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "./ui/select";

export function EditableCellWithFormatting<T>(
  props: CellContext<T, unknown> & { columnConfig: ColumnConfig<T> }
) {
  const { getValue, row, column } = props;
  const columnConfig = (
    column.columnDef.meta as { columnConfig: ColumnConfig<T> }
  ).columnConfig;
  const initialValue = getValue();
  const [value, setValue] = useState<string>(
    typeof initialValue === "string"
      ? initialValue
      : initialValue !== undefined && initialValue !== null
      ? String(initialValue)
      : ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const customColumn = (
    column.columnDef.meta as { columnConfig: ColumnConfig<T> }
  ).columnConfig;

  useEffect(() => {
    setValue(
      typeof initialValue === "string"
        ? initialValue
        : initialValue !== undefined && initialValue !== null
        ? String(initialValue)
        : ""
    );
  }, [initialValue]);

  const onSave = async () => {
    try {
      if (columnConfig.onCellEdit && value !== initialValue) {
        await columnConfig.onCellEdit(value, row.original);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving cell:", error);
      setValue(
        typeof initialValue === "string"
          ? initialValue
          : initialValue !== undefined && initialValue !== null
          ? String(initialValue)
          : ""
      );
      setIsEditing(false);
    }
  };

  const onCancel = () => {
    setValue(
      typeof initialValue === "string"
        ? initialValue
        : initialValue !== undefined && initialValue !== null
        ? String(initialValue)
        : ""
    );
    setIsEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  if (!isEditing) {
    // Use custom cell formatting when not editing
    const displayValue = customColumn?.cell
      ? customColumn.cell(props)
      : initialValue;

    return (
      <div className="flex items-center group">
        <span className="flex-1">{displayValue as React.ReactNode}</span>
        {columnConfig.enableEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center space-x-1"
      onClick={(e) => e.stopPropagation()}
    >
      {columnConfig.editType === "select" ? (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columnConfig.editOptions?.map((option: FilterOption) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={columnConfig.editType || "text"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-7 text-xs"
          autoFocus
          onBlur={onSave}
        />
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onSave}
      >
        <Check className="h-3 w-3 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onCancel}
      >
        <X className="h-3 w-3 text-red-600" />
      </Button>
    </div>
  );
}
