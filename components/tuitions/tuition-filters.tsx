"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  classLevelOptions,
  modeOptions,
  subjectOptions,
} from "@/constants/tuitions";

export interface TuitionFiltersState {
  search: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  minFee: string;
  maxFee: string;
}

export const emptyTuitionFilters: TuitionFiltersState = {
  search: "",
  subject: "",
  classLevel: "",
  mode: "",
  location: "",
  minFee: "",
  maxFee: "",
};

interface TuitionFiltersProps {
  filters: TuitionFiltersState;
  onChange: (patch: Partial<TuitionFiltersState>) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function TuitionFilters({
  filters,
  onChange,
  onReset,
  disabled = false,
}: TuitionFiltersProps) {
  return (
    <section
      aria-label="Filter tuitions"
      className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5 xl:col-span-2">
          <label
            htmlFor="tuition-search"
            className="text-xs font-medium text-slate-700"
          >
            Search by title or subject
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="tuition-search"
              type="search"
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="e.g. Mathematics, HSC physics"
              className="h-9 pl-9"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tuition-subject"
            className="text-xs font-medium text-slate-700"
          >
            Subject
          </label>
          <NativeSelect
            id="tuition-subject"
            value={filters.subject}
            onChange={(event) => onChange({ subject: event.target.value })}
            disabled={disabled}
          >
            <option value="">All subjects</option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tuition-class"
            className="text-xs font-medium text-slate-700"
          >
            Class level
          </label>
          <NativeSelect
            id="tuition-class"
            value={filters.classLevel}
            onChange={(event) => onChange({ classLevel: event.target.value })}
            disabled={disabled}
          >
            <option value="">All class levels</option>
            {classLevelOptions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tuition-mode"
            className="text-xs font-medium text-slate-700"
          >
            Mode
          </label>
          <NativeSelect
            id="tuition-mode"
            value={filters.mode}
            onChange={(event) => onChange({ mode: event.target.value })}
            disabled={disabled}
          >
            <option value="">Online or offline</option>
            {modeOptions
              .filter((option) => option.value !== "hybrid")
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tuition-location"
            className="text-xs font-medium text-slate-700"
          >
            Location
          </label>
          <Input
            id="tuition-location"
            value={filters.location}
            onChange={(event) => onChange({ location: event.target.value })}
            placeholder="e.g. Dhaka"
            className="h-9"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tuition-min-fee"
            className="text-xs font-medium text-slate-700"
          >
            Minimum monthly fee
          </label>
          <Input
            id="tuition-min-fee"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={filters.minFee}
            onChange={(event) => onChange({ minFee: event.target.value })}
            placeholder="0"
            className="h-9"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tuition-max-fee"
            className="text-xs font-medium text-slate-700"
          >
            Maximum monthly fee
          </label>
          <Input
            id="tuition-max-fee"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={filters.maxFee}
            onChange={(event) => onChange({ maxFee: event.target.value })}
            placeholder="Any"
            className="h-9"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Filters update the approved tuition list. Server-side filtering remains
          the source of truth.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={disabled}
        >
          <RotateCcw aria-hidden="true" />
          Reset filters
        </Button>
      </div>
    </section>
  );
}
