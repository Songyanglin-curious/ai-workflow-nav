import { defineStore } from 'pinia';

import type { ProjectNodeDetail, ProjectNodeStatus, ProjectNodeSummary } from '../../../../../shared/project-nodes/index.js';

export type ProjectNodeEditorMode = 'create' | 'edit';

export interface ProjectNodeDraft {
  name: string;
  description: string;
  status: ProjectNodeStatus;
  parentNodeId: string | null;
  sortOrder: number | null;
  workflowId: string | null;
}

export interface ProjectNodesModuleState {
  selectedNodeDetail: ProjectNodeDetail | null;
  detailLoading: boolean;
  editorOpen: boolean;
  editorMode: ProjectNodeEditorMode;
  editingNodeId: string | null;
  editorProjectId: string | null;
  draft: ProjectNodeDraft;
  saving: boolean;
  error: string | null;
}

export function createProjectNodeDraft(): ProjectNodeDraft {
  return {
    name: '',
    description: '',
    status: 'default',
    parentNodeId: null,
    sortOrder: null,
    workflowId: null,
  };
}

export function projectNodeDraftFromDetail(projectNode: ProjectNodeDetail): ProjectNodeDraft {
  return {
    name: projectNode.name,
    description: projectNode.description,
    status: projectNode.status,
    parentNodeId: projectNode.parentNodeId,
    sortOrder: projectNode.sortOrder,
    workflowId: projectNode.workflowId,
  };
}

export function formatProjectNodeTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function buildProjectNodeTree(items: ProjectNodeSummary[]): Array<ProjectNodeSummary & { depth: number }> {
  const childrenMap = new Map<string | null, ProjectNodeSummary[]>();

  for (const item of items) {
    const key = item.parentNodeId;
    const siblings = childrenMap.get(key) ?? [];
    siblings.push(item);
    childrenMap.set(key, siblings);
  }

  for (const siblings of childrenMap.values()) {
    siblings.sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.createdAt.localeCompare(right.createdAt);
    });
  }

  const ordered: Array<ProjectNodeSummary & { depth: number }> = [];

  const visit = (parentNodeId: string | null, depth: number): void => {
    const children = childrenMap.get(parentNodeId) ?? [];

    for (const child of children) {
      ordered.push({
        ...child,
        depth,
      });
      visit(child.id, depth + 1);
    }
  };

  visit(null, 0);

  return ordered;
}

export const useProjectNodesStore = defineStore('project-nodes-module', {
  state: (): ProjectNodesModuleState => ({
    selectedNodeDetail: null,
    detailLoading: false,
    editorOpen: false,
    editorMode: 'create',
    editingNodeId: null,
    editorProjectId: null,
    draft: createProjectNodeDraft(),
    saving: false,
    error: null,
  }),
  actions: {
    openCreateEditor(projectId: string, parentNodeId: string | null = null) {
      this.editorOpen = true;
      this.editorMode = 'create';
      this.editingNodeId = null;
      this.editorProjectId = projectId;
      this.draft = {
        ...createProjectNodeDraft(),
        parentNodeId,
      };
      this.error = null;
    },
    openEditEditor(projectNode: ProjectNodeDetail) {
      this.editorOpen = true;
      this.editorMode = 'edit';
      this.editingNodeId = projectNode.id;
      this.editorProjectId = projectNode.projectId;
      this.draft = projectNodeDraftFromDetail(projectNode);
      this.error = null;
    },
    closeEditor() {
      this.editorOpen = false;
      this.editorMode = 'create';
      this.editingNodeId = null;
      this.editorProjectId = null;
      this.draft = createProjectNodeDraft();
      this.error = null;
    },
    setSelectedNodeDetail(projectNode: ProjectNodeDetail | null) {
      this.selectedNodeDetail = projectNode;
    },
    setError(message: string | null) {
      this.error = message;
    },
  },
});
