import { useState } from "react";
import { ViewState } from "../types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ChevronDown, Trash, Save } from "lucide-react";

export const ViewSelector = ({
  views,
  currentView,
  onViewSelect,
  onDeleteView,
}: {
  views: ViewState[];
  currentView: ViewState | null;
  onViewSelect: (view: ViewState) => void;
  onDeleteView: (viewId: string) => void;
}) => {
  if (views.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="rounded-full">
        <Button variant="outline" size="sm">
          {currentView ? currentView.name : "Select View"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {views.map((view) => (
          <div
            key={view.id}
            className="flex items-center justify-between px-2 py-1 hover:bg-gray-50"
          >
            <button
              className="flex-1 text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
              onClick={() => onViewSelect(view)}
            >
              <div className="flex items-center justify-between">
                <span>{view.name}</span>
                {view.isDefault && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                    Default
                  </span>
                )}
              </div>
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteView(view.id);
              }}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const SaveViewDialog = ({
  onSaveView,
}: {
  onSaveView: (name: string, isDefault: boolean) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    if (viewName.trim()) {
      onSaveView(viewName.trim(), isDefault);
      setViewName("");
      setIsDefault(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="sm">
                <Save className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save View</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Current View</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="View name..."
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save View</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteViewDialog = ({
  viewToDelete,
  onConfirm,
  onCancel,
}: {
  viewToDelete: ViewState | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <Dialog open={!!viewToDelete} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete View</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the view &quot;{viewToDelete?.name}
          &quot;? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
