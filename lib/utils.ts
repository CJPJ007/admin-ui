import { FilterType } from "@/utils/interfaces";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const convertToSearchCriteriaList = (filters: FilterType[]) => {
    const searchCriteriaList = {
      criteriaList: [] as { key: string; operation: string; value: string }[],
      operations: [] as string[],
    };
    filters.forEach((filter, index) => {
      if (!filter.field || !filter.value) return;
      searchCriteriaList.criteriaList.push({
        key: filter.field,
        operation: filter.operator,
        value: filter.value,
      });
      if (index > 0) searchCriteriaList.operations.push("AND");
    });

    return searchCriteriaList;
  };