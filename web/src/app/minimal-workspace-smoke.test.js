// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { bootstrapApplication, shutdownApplication } from '../../../server/src/app/bootstrap.js';
import { createTestWorkspace } from '../../../server/src/test/test-workspace.js';
import { createProject } from '../modules/projects/api.js';
import { createProjectNode } from '../modules/projects/project-nodes/api.js';
import {
  getWorkflowRuntimeNodeDetail,
  triggerWorkflowRuntimeNodeAction,
} from '../modules/projects/project-nodes/runtime-actions/api.js';
import {
  getProjectViewport,
  listProjectNodeLayouts,
  patchProjectNodeLayouts,
  patchProjectViewport,
} from '../modules/projects/view-config/api.js';
import { createPrompt } from '../modules/prompts/api.js';
import { httpClient } from '../shared/api/http-client.js';
import { createWorkflow } from '../modules/workflows/api.js';
import { createNodeAction } from '../modules/workflows/node-actions/api.js';

describe('minimal workspace smoke', () => {
  let workspace;
  let bootstrapResult;
  let originalBaseUrl;

  beforeAll(async () => {
    workspace = await createTestWorkspace();
    bootstrapResult = await bootstrapApplication({
      workspaceRootPath: workspace.rootPath,
      port: 0,
    });

    originalBaseUrl = httpClient.baseUrl;
    httpClient.baseUrl = bootstrapResult.address;
  });

  afterAll(async () => {
    httpClient.baseUrl = originalBaseUrl;

    if (bootstrapResult) {
      await shutdownApplication(bootstrapResult);
    }

    if (workspace) {
      await workspace.cleanup();
    }
  });

  it('通过前端 API 跑通核心工作区最小闭环', async () => {
    const prompt = await createPrompt({
      name: '需求分析提示词',
      description: '用于最小联调冒烟',
      content: '# 角色\n你是一个需求分析助手。',
    });

    const workflow = await createWorkflow({
      name: '需求分析工作流',
      mermaidSource: [
        'flowchart TD',
        '  start[开始] --> analyze[分析需求]',
        '  analyze --> done[输出结果]',
      ].join('\n'),
    });

    const nodeAction = await createNodeAction(workflow.id, {
      mermaidNodeId: 'analyze',
      actionType: 'prompt',
      targetRef: prompt.id,
    });

    const project = await createProject({
      name: '联调项目',
      description: '最小可运行联调',
    });

    const projectNode = await createProjectNode(project.id, {
      name: '需求节点',
      workflowId: workflow.id,
    });

    const updatedCount = await patchProjectNodeLayouts(project.id, {
      items: [
        {
          projectNodeId: projectNode.id,
          positionX: 120,
          positionY: 240,
        },
      ],
    });

    const layouts = await listProjectNodeLayouts(project.id);
    const viewport = await patchProjectViewport(project.id, {
      viewportX: 12,
      viewportY: 24,
      zoom: 1.25,
    });
    const persistedViewport = await getProjectViewport(project.id);
    const runtimeDetail = await getWorkflowRuntimeNodeDetail(projectNode.id, 'analyze');
    const runtimeTriggerResult = await triggerWorkflowRuntimeNodeAction(projectNode.id, 'analyze');

    expect(prompt.name).toBe('需求分析提示词');
    expect(nodeAction.mermaidNodeId).toBe('analyze');
    expect(projectNode.workflowId).toBe(workflow.id);
    expect(updatedCount).toBe(1);
    expect(layouts).toHaveLength(1);
    expect(layouts[0]).toMatchObject({
      projectNodeId: projectNode.id,
      positionX: 120,
      positionY: 240,
    });
    expect(viewport).toMatchObject({
      projectId: project.id,
      viewportX: 12,
      viewportY: 24,
      zoom: 1.25,
    });
    expect(persistedViewport).toMatchObject({
      projectId: project.id,
      viewportX: 12,
      viewportY: 24,
      zoom: 1.25,
    });
    expect(runtimeDetail).toMatchObject({
      projectNodeId: projectNode.id,
      workflowId: workflow.id,
      mermaidNodeId: 'analyze',
      hasBinding: true,
      action: {
        actionType: 'prompt',
        targetRef: prompt.id,
        targetName: prompt.name,
        isExecutable: true,
        failureReason: null,
      },
    });
    expect(runtimeTriggerResult).toEqual({
      actionType: 'prompt',
      promptId: prompt.id,
      promptName: prompt.name,
      copyText: '# 角色\n你是一个需求分析助手。',
    });
  });
});
