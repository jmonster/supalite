import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { ReactNode } from 'react';

type StudioGridColumnType = "text" | "number" | "boolean" | "date" | "json" | "unknown";
interface StudioGridColumn {
    key: string;
    name: string;
    type: StudioGridColumnType | string;
    width?: number;
    sortable?: boolean;
    editable?: boolean;
    isPrimaryKey?: boolean;
}
type StudioGridRow = Record<string, unknown>;
interface StudioGridSort {
    column: string;
    ascending: boolean;
}
type StudioGridFilterOperator = "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "like" | "ilike" | "in";
interface StudioGridFilter {
    column: string;
    operator: StudioGridFilterOperator | string;
    value: string;
    linkOperator?: "AND" | "OR";
}
interface SupabaseGridProps {
    columns: StudioGridColumn[];
    data: StudioGridRow[];
    headerVariant?: "old" | "new";
    currentSort?: StudioGridSort[];
    filters?: StudioGridFilter[];
    isLoading?: boolean;
    isError?: boolean;
    errorMessage?: string;
    emptyMessage?: string;
    customHeader?: ReactNode;
    className?: string;
    height?: number | string;
    rowKeyField?: string;
    rowKeyGetter?: (row: StudioGridRow) => string | number;
    readOnly?: boolean;
    defaultPageSize?: number;
    pageSizeOptions?: number[];
    onUpdateRow?: (nextRow: StudioGridRow, previousRow: StudioGridRow) => void;
    onSortChange?: (sorts: StudioGridSort[]) => void;
    onInsertRow?: () => void;
    onInsertColumn?: () => void;
    onImportCsv?: () => void;
    onOpenInsertPanel?: () => void;
    onFilterChange?: (filters: StudioGridFilter[]) => void;
    onBulkDeleteRows?: (rows: StudioGridRow[], c: {
        resetSelectedRows: () => void;
    }) => void;
    onBulkCopyRows?: (rows: StudioGridRow[]) => void;
    onBulkExportRows?: (rows: StudioGridRow[]) => void;
}

declare const SupabaseGrid: ({ columns, data, headerVariant, currentSort, filters, isLoading, isError, errorMessage, emptyMessage, customHeader, className, height, rowKeyField, rowKeyGetter, readOnly, defaultPageSize, pageSizeOptions, onUpdateRow, onSortChange, onInsertRow, onInsertColumn, onImportCsv, onOpenInsertPanel, onFilterChange, onBulkDeleteRows, onBulkCopyRows, onBulkExportRows, }: SupabaseGridProps) => react_jsx_runtime.JSX.Element;

declare enum ENTITY_TYPE {
    TABLE = "r",
    VIEW = "v",
    MATERIALIZED_VIEW = "m",
    FOREIGN_TABLE = "f",
    PARTITIONED_TABLE = "p"
}

interface Entity {
    id: number;
    schema: string;
    name: string;
    type: ENTITY_TYPE;
    comment: string | null;
    rls_enabled: boolean;
}

type StudioContext = {
    /** Base path used when Studio is mounted below another application's route. */
    basePath?: string;
    projectName?: string;
    header?: {
        nonProdLabel?: string;
        backHref?: string;
        backLabel?: string;
    };
    editor?: {
        readOnly?: boolean;
        rows?: StudioGridRow[];
        columns?: StudioGridColumn[];
        sorts?: StudioGridSort[];
        entities?: Entity[];
        entityActiveId?: number | string;
        entityHref?: (entity: Entity) => string;
        onEntityClick?: (entity: Entity) => void;
        filters?: StudioGridFilter[];
        onUpdateRow?: (nextRow: StudioGridRow, previousRow: StudioGridRow) => void;
        onInsertRow?: () => void;
        onInsertColumn?: () => void;
        onImportCsv?: () => void;
        onOpenInsertPanel?: () => void;
        onFilterChange?: (filters: StudioGridFilter[]) => void;
        onBulkDeleteRows?: (rows: StudioGridRow[], c: {
            resetSelectedRows: () => void;
        }) => void;
        setSorts?: (sorts: StudioGridSort[]) => void;
        setFilters?: (filters: StudioGridFilter[]) => void;
        schema?: string;
        schemas?: string[];
        onChangeSchema?: (schema: string) => void;
        rowKeyGetter?: (row: StudioGridRow) => string | number;
    };
    auth?: {
        enabled?: boolean;
    };
};
declare const StudioContext: react.Context<StudioContext>;

declare function Studio(props: StudioContext): react_jsx_runtime.JSX.Element;

/** minimal column shape from DB introspection (lite app or compatible) */
interface InsertRowFormColumnSource {
    name: string;
    type: string;
    nullable: boolean;
    default_value: string | null;
    is_identity: boolean;
    is_primary_key: boolean;
}
type InsertRowValueKind = "text" | "number" | "boolean" | "json";
interface InsertRowFormField {
    name: string;
    dbType: string;
    nullable: boolean;
    hasDefault: boolean;
    defaultHint: string | null;
    valueKind: InsertRowValueKind;
}

/** builds editable insert fields; omits identity columns (DB-generated) */
declare function buildInsertRowFormFields(columns: InsertRowFormColumnSource[]): InsertRowFormField[];

type InsertRowFormValues = Record<string, string>;
interface ParseInsertValuesResult {
    payload: Record<string, unknown>;
    errors: Record<string, string>;
}
/** coerce string form values into a PostgREST-friendly insert payload */
declare function parseInsertValues(values: InsertRowFormValues, fields: InsertRowFormField[]): ParseInsertValuesResult;
declare function initialInsertFormValues(fields: InsertRowFormField[]): InsertRowFormValues;

interface InsertRowFormProps {
    fields: InsertRowFormField[];
    values: InsertRowFormValues;
    errors?: Record<string, string>;
    onChange: (values: InsertRowFormValues) => void;
    /** called on implicit submit (e.g. Enter in a text input), like a native form */
    onSubmit?: () => void;
    className?: string;
}
/** basic insert form styled like the Supabase studio row editor (horizontal labels, shared inputs) */
declare function InsertRowForm({ fields, values, errors, onChange, onSubmit, className, }: InsertRowFormProps): react_jsx_runtime.JSX.Element;

export { type Entity, InsertRowForm, type InsertRowFormColumnSource, type InsertRowFormField, type InsertRowFormValues, Studio, StudioContext, type StudioGridColumn, type StudioGridColumnType, type StudioGridFilter, type StudioGridFilterOperator, type StudioGridRow, type StudioGridSort, SupabaseGrid, type SupabaseGridProps, buildInsertRowFormFields, initialInsertFormValues, parseInsertValues };
