import { defineStore } from 'pinia';

export interface RuntimeSessionState {
  sessionId: string;
  openedAt: number;
  lastTouchedAt: number;
  activeProjectNodeId: string | null;
  activeWorkflowNodeId: string | null;
}

const createSessionId = (): string => {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `session-${Date.now().toString(36)}-${suffix}`;
};

export const useSessionStore = defineStore('runtime-session', {
  state: (): RuntimeSessionState => ({
    sessionId: createSessionId(),
    openedAt: Date.now(),
    lastTouchedAt: Date.now(),
    activeProjectNodeId: null,
    activeWorkflowNodeId: null,
  }),
  actions: {
    replaceSessionId(sessionId: string) {
      this.sessionId = sessionId;
      this.lastTouchedAt = Date.now();
    },
    touch() {
      this.lastTouchedAt = Date.now();
    },
    setActiveProjectNodeId(projectNodeId: string | null) {
      this.activeProjectNodeId = projectNodeId;
      this.lastTouchedAt = Date.now();
    },
    setActiveWorkflowNodeId(workflowNodeId: string | null) {
      this.activeWorkflowNodeId = workflowNodeId;
      this.lastTouchedAt = Date.now();
    },
    reset() {
      const now = Date.now();
      this.sessionId = createSessionId();
      this.openedAt = now;
      this.lastTouchedAt = now;
      this.activeProjectNodeId = null;
      this.activeWorkflowNodeId = null;
    },
  },
});
