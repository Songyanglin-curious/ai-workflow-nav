import { defineStore } from 'pinia';

export type RuntimeSortOrder = 'asc' | 'desc';

export interface RuntimeFiltersState {
  query: string;
  labels: string[];
  scope: string | null;
  sortKey: string;
  sortOrder: RuntimeSortOrder;
}

export const useFiltersStore = defineStore('runtime-filters', {
  state: (): RuntimeFiltersState => ({
    query: '',
    labels: [],
    scope: null,
    sortKey: 'updatedAt',
    sortOrder: 'desc',
  }),
  actions: {
    setQuery(query: string) {
      this.query = query;
    },
    setLabels(labels: string[]) {
      this.labels = labels;
    },
    toggleLabel(label: string) {
      if (this.labels.includes(label)) {
        this.labels = this.labels.filter((item) => item !== label);
        return;
      }

      this.labels = [...this.labels, label];
    },
    setScope(scope: string | null) {
      this.scope = scope;
    },
    setSort(sortKey: string, sortOrder: RuntimeSortOrder) {
      this.sortKey = sortKey;
      this.sortOrder = sortOrder;
    },
    reset() {
      this.query = '';
      this.labels = [];
      this.scope = null;
      this.sortKey = 'updatedAt';
      this.sortOrder = 'desc';
    },
  },
});
