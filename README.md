# Adizen.ai Enhanced DataTable Component

[![npm version](https://badge.fury.io/js/adizen-tanstack-table.svg)](https://badge.fury.io/js/adizen-tanstack-table)
[![GitHub](https://img.shields.io/github/license/jainvedant392/adizen-tanstack-table)](https://github.com/jainvedant392/adizen-tanstack-table/blob/main/LICENSE)

A powerful, feature-rich React data table component built with **TanStack Table** and **Shadcn UI**.

## Features

- ✅ **Sorting & Filtering**: Column-level and global search
- ✅ **Pagination**: Configurable page sizes
- ✅ **Column Management**: Show/hide columns
- ✅ **Custom Views**: Save and load table configurations
- ✅ **CSV Export**: Export current page or all filtered data
- ✅ **Date Range Filtering**: Built-in date filtering
- ✅ **Editable Cells**: Inline editing support
- ✅ **Sub-rows**: Expandable nested data
- ✅ **Loading States**: Skeleton loaders
- ✅ **TypeScript**: Full type safety

## Installation

```bash
npm install adizen-tanstack-table
```

## Required Peer Dependencies

```bash
npm install @tanstack/react-table lucide-react clsx tailwind-merge

npm install @radix-ui/react-slot @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-icons
```

## Required Shadcn UI Components
```bash
npx shadcn-ui@latest add table button skeleton dropdown-menu select dialog input
```

## Usage

Import the **EnhancedDataTable** component and **ColumnConfig** type from this package.
```
import {EnhancedDataTable} from "adizen-tanstack-table";
import type {ColumnConfig} from "adizen-tanstack-table/dist/types";
```

## License
MIT

## Contributing
Issues and pull requests are welcome!

