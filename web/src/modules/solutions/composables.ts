import { computed, ref, type ComputedRef, type Ref } from 'vue';

import { listProjects } from '../projects/api.js';
import {
  bindSolutionProject,
  createSolution,
  deleteSolution,
  deleteSolutionProject,
  getSolution,
  listProjectSolutions,
  listSolutionProjects,
  listSolutions,
  patchSolutionProject,
  updateSolution,
} from './api.js';
import type {
  CreateSolutionRequest,
  PatchSolutionProjectRequest,
  ProjectSolutionItem,
  ProjectSummary,
  SolutionDetail,
  SolutionListQuery,
  SolutionProjectItem,
  SolutionSummary,
  UpdateSolutionRequest,
} from '../../../../shared/projects/index.js';

export type SolutionBindingDialogMode = 'bind' | 'manage';

export interface SolutionDraft {
  name: string;
  description: string;
  tags: string;
  category: string;
}

export interface SolutionProjectBindingDraft {
  projectId: string | null;
  sortOrder: number | null;
}

export interface UseSolutionsModuleState {
  items: Ref<SolutionSummary[]>;
  keyword: Ref<string>;
  category: Ref<string>;
  selectedSolutionId: Ref<string | null>;
  selectedSolution: Ref<SolutionDetail | null>;
  draft: Ref<SolutionDraft>;
  isCreating: Ref<boolean>;
  solutionProjects: Ref<SolutionProjectItem[]>;
  projectCatalog: Ref<ProjectSummary[]>;
  bindableProjects: ComputedRef<ProjectSummary[]>;
  selectedProjectSolutions: Ref<ProjectSolutionItem[]>;
  listLoading: Ref<boolean>;
  detailLoading: Ref<boolean>;
  projectsLoading: Ref<boolean>;
  projectCatalogLoading: Ref<boolean>;
  bindingRelationsLoading: Ref<boolean>;
  saving: Ref<boolean>;
  deleting: Ref<boolean>;
  bindingPending: Ref<boolean>;
  listError: Ref<string | null>;
  detailError: Ref<string | null>;
  projectsError: Ref<string | null>;
  saveError: Ref<string | null>;
  deleteError: Ref<string | null>;
  bindingError: Ref<string | null>;
  bindingDialogOpen: Ref<boolean>;
  bindingDialogMode: Ref<SolutionBindingDialogMode>;
  bindingDraft: Ref<SolutionProjectBindingDraft>;
  bindingTarget: Ref<SolutionProjectItem | null>;
  initialize: () => Promise<void>;
  refreshList: (options?: { selectFirst?: boolean; preserveSelection?: boolean }) => Promise<void>;
  searchSolutions: () => Promise<void>;
  selectSolution: (solutionId: string) => Promise<void>;
  startCreate: () => void;
  resetDraft: () => void;
  saveSolution: () => Promise<void>;
  deleteCurrentSolution: () => Promise<void>;
  refreshSolutionProjects: () => Promise<void>;
  openBindingDialog: (binding?: SolutionProjectItem | null) => Promise<void>;
  closeBindingDialog: () => void;
  updateBindingDraft: (draft: SolutionProjectBindingDraft) => Promise<void>;
  submitBindingDialog: () => Promise<void>;
  removeBinding: () => Promise<void>;
}

export function formatSolutionTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function createEmptySolutionDraft(): SolutionDraft {
  return {
    name: '',
    description: '',
    tags: '',
    category: '',
  };
}

function createEmptyBindingDraft(): SolutionProjectBindingDraft {
  return {
    projectId: null,
    sortOrder: null,
  };
}

function toSolutionDraft(solution: SolutionDetail): SolutionDraft {
  return {
    name: solution.name,
    description: solution.description,
    tags: solution.tags,
    category: solution.category,
  };
}

function toCreateSolutionRequest(draft: SolutionDraft): CreateSolutionRequest {
  return {
    name: draft.name,
    description: draft.description,
    tags: draft.tags,
    category: draft.category,
  };
}

function toUpdateSolutionRequest(draft: SolutionDraft): UpdateSolutionRequest {
  return {
    name: draft.name,
    description: draft.description,
    tags: draft.tags,
    category: draft.category,
  };
}

function toSolutionListQuery(keyword: string, category: string): SolutionListQuery {
  const trimmedKeyword = keyword.trim();
  const trimmedCategory = category.trim();

  return {
    keyword: trimmedKeyword.length > 0 ? trimmedKeyword : undefined,
    category: trimmedCategory.length > 0 ? trimmedCategory : undefined,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '请求失败';
}

export function useSolutionsModule(): UseSolutionsModuleState {
  const items = ref<SolutionSummary[]>([]);
  const keyword = ref('');
  const category = ref('');
  const selectedSolutionId = ref<string | null>(null);
  const selectedSolution = ref<SolutionDetail | null>(null);
  const draft = ref<SolutionDraft>(createEmptySolutionDraft());
  const isCreating = ref(false);
  const solutionProjects = ref<SolutionProjectItem[]>([]);
  const projectCatalog = ref<ProjectSummary[]>([]);
  const selectedProjectSolutions = ref<ProjectSolutionItem[]>([]);

  const listLoading = ref(false);
  const detailLoading = ref(false);
  const projectsLoading = ref(false);
  const projectCatalogLoading = ref(false);
  const bindingRelationsLoading = ref(false);
  const saving = ref(false);
  const deleting = ref(false);
  const bindingPending = ref(false);

  const listError = ref<string | null>(null);
  const detailError = ref<string | null>(null);
  const projectsError = ref<string | null>(null);
  const saveError = ref<string | null>(null);
  const deleteError = ref<string | null>(null);
  const bindingError = ref<string | null>(null);

  const bindingDialogOpen = ref(false);
  const bindingDialogMode = ref<SolutionBindingDialogMode>('bind');
  const bindingDraft = ref<SolutionProjectBindingDraft>(createEmptyBindingDraft());
  const bindingTarget = ref<SolutionProjectItem | null>(null);

  const bindableProjects = computed(() => {
    const boundProjectIds = new Set(solutionProjects.value.map((item) => item.projectId));

    return projectCatalog.value.filter((project) => {
      if (bindingDialogMode.value === 'manage' && project.id === bindingTarget.value?.projectId) {
        return true;
      }

      return !boundProjectIds.has(project.id);
    });
  });

  function clearSelection(): void {
    selectedSolutionId.value = null;
    selectedSolution.value = null;
    solutionProjects.value = [];
    selectedProjectSolutions.value = [];
    detailError.value = null;
    projectsError.value = null;
    detailLoading.value = false;
    projectsLoading.value = false;
  }

  function startCreate(): void {
    isCreating.value = true;
    clearSelection();
    draft.value = createEmptySolutionDraft();
    saveError.value = null;
    deleteError.value = null;
  }

  function resetDraft(): void {
    draft.value = selectedSolution.value && !isCreating.value
      ? toSolutionDraft(selectedSolution.value)
      : createEmptySolutionDraft();
    saveError.value = null;
  }

  async function refreshProjectCatalog(): Promise<void> {
    projectCatalogLoading.value = true;

    try {
      projectCatalog.value = await listProjects();
    } finally {
      projectCatalogLoading.value = false;
    }
  }

  async function refreshList(options: { selectFirst?: boolean; preserveSelection?: boolean } = {}): Promise<void> {
    listLoading.value = true;
    listError.value = null;

    try {
      items.value = await listSolutions(toSolutionListQuery(keyword.value, category.value));

      if (options.preserveSelection && selectedSolutionId.value) {
        const stillExists = items.value.some((item) => item.id === selectedSolutionId.value);

        if (stillExists) {
          await selectSolution(selectedSolutionId.value);
          return;
        }
      }

      if (options.selectFirst && items.value.length > 0) {
        await selectSolution(items.value[0].id);
      } else if (items.value.length === 0) {
        startCreate();
      }
    } catch (error) {
      listError.value = getErrorMessage(error);
    } finally {
      listLoading.value = false;
    }
  }

  async function refreshSolutionProjects(): Promise<void> {
    if (!selectedSolutionId.value) {
      solutionProjects.value = [];
      return;
    }

    projectsLoading.value = true;
    projectsError.value = null;

    try {
      solutionProjects.value = await listSolutionProjects(selectedSolutionId.value);
    } catch (error) {
      projectsError.value = getErrorMessage(error);
    } finally {
      projectsLoading.value = false;
    }
  }

  async function initialize(): Promise<void> {
    await Promise.all([refreshProjectCatalog(), refreshList({ selectFirst: true })]);
  }

  async function searchSolutions(): Promise<void> {
    clearSelection();
    await refreshList({ selectFirst: true });
  }

  async function selectSolution(solutionId: string): Promise<void> {
    isCreating.value = false;
    selectedSolutionId.value = solutionId;
    selectedSolution.value = null;
    solutionProjects.value = [];
    selectedProjectSolutions.value = [];
    detailError.value = null;
    projectsError.value = null;
    detailLoading.value = true;
    projectsLoading.value = true;

    try {
      const [solution, projects] = await Promise.all([
        getSolution(solutionId),
        listSolutionProjects(solutionId),
      ]);

      selectedSolution.value = solution;
      draft.value = toSolutionDraft(solution);
      solutionProjects.value = projects;
    } catch (error) {
      detailError.value = getErrorMessage(error);
    } finally {
      detailLoading.value = false;
      projectsLoading.value = false;
    }
  }

  async function saveSolution(): Promise<void> {
    saving.value = true;
    saveError.value = null;

    try {
      const solution = isCreating.value
        ? await createSolution(toCreateSolutionRequest(draft.value))
        : await updateSolution(selectedSolutionId.value as string, toUpdateSolutionRequest(draft.value));

      selectedSolutionId.value = solution.id;
      selectedSolution.value = solution;
      draft.value = toSolutionDraft(solution);
      isCreating.value = false;
      await refreshList({ preserveSelection: true });
    } catch (error) {
      saveError.value = getErrorMessage(error);
    } finally {
      saving.value = false;
    }
  }

  async function deleteCurrentSolution(): Promise<void> {
    if (!selectedSolutionId.value || isCreating.value) {
      return;
    }

    deleting.value = true;
    deleteError.value = null;

    try {
      await deleteSolution(selectedSolutionId.value);
      clearSelection();
      await refreshList({ selectFirst: true });
    } catch (error) {
      deleteError.value = getErrorMessage(error);
    } finally {
      deleting.value = false;
    }
  }

  async function refreshSelectedProjectSolutions(projectId: string | null): Promise<void> {
    if (!projectId) {
      selectedProjectSolutions.value = [];
      return;
    }

    bindingRelationsLoading.value = true;

    try {
      selectedProjectSolutions.value = await listProjectSolutions(projectId);
    } catch (error) {
      bindingError.value = getErrorMessage(error);
    } finally {
      bindingRelationsLoading.value = false;
    }
  }

  async function openBindingDialog(binding: SolutionProjectItem | null = null): Promise<void> {
    if (!selectedSolutionId.value) {
      return;
    }

    bindingError.value = null;
    bindingTarget.value = binding;
    bindingDialogMode.value = binding ? 'manage' : 'bind';
    bindingDraft.value = binding
      ? {
          projectId: binding.projectId,
          sortOrder: binding.sortOrder,
        }
      : createEmptyBindingDraft();

    await refreshProjectCatalog();
    await refreshSelectedProjectSolutions(bindingDraft.value.projectId);
    bindingDialogOpen.value = true;
  }

  function closeBindingDialog(): void {
    bindingDialogOpen.value = false;
    bindingTarget.value = null;
    bindingDraft.value = createEmptyBindingDraft();
    selectedProjectSolutions.value = [];
    bindingError.value = null;
  }

  async function updateBindingDraft(nextDraft: SolutionProjectBindingDraft): Promise<void> {
    const projectIdChanged = nextDraft.projectId !== bindingDraft.value.projectId;
    bindingDraft.value = nextDraft;

    if (projectIdChanged) {
      bindingError.value = null;
      await refreshSelectedProjectSolutions(nextDraft.projectId);
    }
  }

  async function refreshAfterBindingChange(): Promise<void> {
    await Promise.all([refreshList({ preserveSelection: true }), refreshProjectCatalog()]);
  }

  async function submitBindingDialog(): Promise<void> {
    if (!selectedSolutionId.value) {
      return;
    }

    bindingPending.value = true;
    bindingError.value = null;

    try {
      if (bindingDialogMode.value === 'bind') {
        if (!bindingDraft.value.projectId) {
          throw new Error('请选择一个项目后再创建绑定。');
        }

        await bindSolutionProject(selectedSolutionId.value, {
          projectId: bindingDraft.value.projectId,
          sortOrder: bindingDraft.value.sortOrder ?? undefined,
        });
      } else {
        if (!bindingTarget.value || bindingDraft.value.sortOrder === null) {
          throw new Error('当前绑定缺少可更新的排序值。');
        }

        const patch: PatchSolutionProjectRequest = {
          sortOrder: bindingDraft.value.sortOrder,
        };

        await patchSolutionProject(selectedSolutionId.value, bindingTarget.value.projectId, patch);
      }

      closeBindingDialog();
      await refreshAfterBindingChange();
    } catch (error) {
      bindingError.value = getErrorMessage(error);
    } finally {
      bindingPending.value = false;
    }
  }

  async function removeBinding(): Promise<void> {
    if (!selectedSolutionId.value || !bindingTarget.value) {
      return;
    }

    bindingPending.value = true;
    bindingError.value = null;

    try {
      await deleteSolutionProject(selectedSolutionId.value, bindingTarget.value.projectId);
      closeBindingDialog();
      await refreshAfterBindingChange();
    } catch (error) {
      bindingError.value = getErrorMessage(error);
    } finally {
      bindingPending.value = false;
    }
  }

  return {
    items,
    keyword,
    category,
    selectedSolutionId,
    selectedSolution,
    draft,
    isCreating,
    solutionProjects,
    projectCatalog,
    bindableProjects,
    selectedProjectSolutions,
    listLoading,
    detailLoading,
    projectsLoading,
    projectCatalogLoading,
    bindingRelationsLoading,
    saving,
    deleting,
    bindingPending,
    listError,
    detailError,
    projectsError,
    saveError,
    deleteError,
    bindingError,
    bindingDialogOpen,
    bindingDialogMode,
    bindingDraft,
    bindingTarget,
    initialize,
    refreshList,
    searchSolutions,
    selectSolution,
    startCreate,
    resetDraft,
    saveSolution,
    deleteCurrentSolution,
    refreshSolutionProjects,
    openBindingDialog,
    closeBindingDialog,
    updateBindingDraft,
    submitBindingDialog,
    removeBinding,
  };
}
