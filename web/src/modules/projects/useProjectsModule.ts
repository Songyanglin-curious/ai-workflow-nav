import { computed, ref, shallowRef, type ComputedRef, type Ref, type ShallowRef } from 'vue';

import { createProject, getProject, listProjects, updateProject } from './api.js';
import type { ProjectDetail, ProjectSummary } from '../../../../shared/projects/index.js';

export interface ProjectDraft {
  name: string;
  description: string;
  tags: string;
  category: string;
}

export interface UseProjectsModuleState {
  items: Ref<ProjectSummary[]>;
  keyword: Ref<string>;
  category: Ref<string>;
  selectedProjectId: Ref<string | null>;
  selectedProject: Ref<ProjectDetail | null>;
  draft: Ref<ProjectDraft>;
  loadingList: Ref<boolean>;
  loadingDetail: Ref<boolean>;
  saving: Ref<boolean>;
  error: ShallowRef<Error | null>;
  projectCount: ComputedRef<number>;
  isCreating: ComputedRef<boolean>;
  initialize: () => Promise<void>;
  refreshList: (options?: { preferredProjectId?: string; preserveSelection?: boolean }) => Promise<void>;
  searchProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  startCreateProject: () => void;
  saveProject: () => Promise<void>;
  resetDraft: () => void;
}

export function createProjectDraft(): ProjectDraft {
  return {
    name: '',
    description: '',
    tags: '',
    category: '',
  };
}

export function projectDraftFromDetail(project: ProjectDetail): ProjectDraft {
  return {
    name: project.name,
    description: project.description,
    tags: project.tags,
    category: project.category,
  };
}

function projectSummaryFromDetail(project: ProjectDetail): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    tags: project.tags,
    category: project.category,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

function upsertProjectSummary(items: ProjectSummary[], project: ProjectSummary): ProjectSummary[] {
  const index = items.findIndex((item) => item.id === project.id);

  if (index === -1) {
    return [project, ...items];
  }

  return items.map((item) => (item.id === project.id ? project : item));
}

export function formatProjectTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function useProjectsModule(): UseProjectsModuleState {
  const items = ref<ProjectSummary[]>([]);
  const keyword = ref('');
  const category = ref('');
  const selectedProjectId = ref<string | null>(null);
  const selectedProject = ref<ProjectDetail | null>(null);
  const draft = ref<ProjectDraft>(createProjectDraft());

  const loadingList = ref(false);
  const loadingDetail = ref(false);
  const saving = ref(false);
  const error = shallowRef<Error | null>(null);

  const projectCount = computed(() => items.value.length);
  const isCreating = computed(() => selectedProjectId.value === null);

  async function initialize(): Promise<void> {
    await refreshList();
  }

  async function refreshList(options: { preferredProjectId?: string; preserveSelection?: boolean } = {}): Promise<void> {
    loadingList.value = true;
    error.value = null;

    try {
      items.value = await listProjects({
        keyword: keyword.value.trim() || undefined,
        category: category.value.trim() || undefined,
      });

      const preferredProjectId =
        options.preferredProjectId ?? (options.preserveSelection === false ? null : selectedProjectId.value);

      if (preferredProjectId && items.value.some((item) => item.id === preferredProjectId)) {
        if (selectedProjectId.value !== preferredProjectId || selectedProject.value === null) {
          await selectProject(preferredProjectId);
        }
        return;
      }

      if (items.value.length > 0) {
        await selectProject(items.value[0].id);
        return;
      }

      startCreateProject();
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('项目列表加载失败');
      throw error.value;
    } finally {
      loadingList.value = false;
    }
  }

  async function searchProjects(): Promise<void> {
    selectedProjectId.value = null;
    selectedProject.value = null;
    draft.value = createProjectDraft();
    await refreshList({ preserveSelection: false });
  }

  async function selectProject(projectId: string): Promise<void> {
    selectedProjectId.value = projectId;
    loadingDetail.value = true;
    error.value = null;

    try {
      const project = await getProject(projectId);
      selectedProject.value = project;
      draft.value = projectDraftFromDetail(project);
      items.value = upsertProjectSummary(items.value, projectSummaryFromDetail(project));
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('项目详情加载失败');
      throw error.value;
    } finally {
      loadingDetail.value = false;
    }
  }

  function startCreateProject(): void {
    selectedProjectId.value = null;
    selectedProject.value = null;
    draft.value = createProjectDraft();
    error.value = null;
  }

  async function saveProject(): Promise<void> {
    saving.value = true;
    error.value = null;

    try {
      const project = selectedProjectId.value
        ? await updateProject(selectedProjectId.value, draft.value)
        : await createProject(draft.value);

      selectedProjectId.value = project.id;
      selectedProject.value = project;
      draft.value = projectDraftFromDetail(project);
      items.value = upsertProjectSummary(items.value, projectSummaryFromDetail(project));
      await refreshList({ preferredProjectId: project.id });
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('项目保存失败');
      throw error.value;
    } finally {
      saving.value = false;
    }
  }

  function resetDraft(): void {
    if (selectedProject.value) {
      draft.value = projectDraftFromDetail(selectedProject.value);
      return;
    }

    draft.value = createProjectDraft();
  }

  return {
    items,
    keyword,
    category,
    selectedProjectId,
    selectedProject,
    draft,
    loadingList,
    loadingDetail,
    saving,
    error,
    projectCount,
    isCreating,
    initialize,
    refreshList,
    searchProjects,
    selectProject,
    startCreateProject,
    saveProject,
    resetDraft,
  };
}
