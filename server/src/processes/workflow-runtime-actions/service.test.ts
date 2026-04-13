import assert from 'node:assert/strict';
import { removePath } from '../../infra/filesystem/index.js';
import { resolvePromptPath } from '../../infra/workspace/index.js';
import test from 'node:test';

import { createProjectNodeService } from '../../domains/projects/project-nodes/service.js';
import { PromptNotFoundError } from '../../domains/prompts/errors.js';
import { createPromptService } from '../../domains/prompts/service.js';
import { createWorkflowService } from '../../domains/workflows/service.js';
import { createWorkflowNodeActionService } from '../../domains/workflows/node-actions/service.js';
import { createProjectService } from '../../domains/projects/service.js';
import { createTestContext } from '../../test/test-context.js';
import type { ExternalToolsService } from '../external-tools/types.js';
import { createWorkflowRuntimeActionsService } from './service.js';

function createExternalToolsStub(): ExternalToolsService {
  return {
    toolExists(): boolean {
      return false;
    },
    getToolLabel(): string | undefined {
      return undefined;
    },
    async openFile() {
      throw new Error('当前测试不应调用 openFile。');
    },
    async openFolder() {
      throw new Error('当前测试不应调用 openFolder。');
    },
    async openPath() {
      throw new Error('当前测试不应调用 openPath。');
    },
    async openAtLine() {
      throw new Error('当前测试不应调用 openAtLine。');
    },
  };
}

async function createPromptRuntimeFixture() {
  const context = await createTestContext();
  const promptService = createPromptService(context.database, context.workspacePaths);
  const workflowService = createWorkflowService(context.database);
  const projectService = createProjectService(context.database, context.workspacePaths);
  const projectNodeService = createProjectNodeService(context.database, context.workspacePaths);
  const nodeActionService = createWorkflowNodeActionService(context.database);
  const prompt = await promptService.createPrompt({
    name: '运行时提示词',
    content: 'runtime prompt content',
  });
  const workflow = workflowService.createWorkflow({
    name: '运行时工作流',
    mermaidSource: 'flowchart TD\nSTART[开始]\nEND[结束]\nSTART --> END',
  });
  const project = await projectService.createProject({
    name: '项目 A',
  });
  const projectNode = await projectNodeService.createProjectNode(project.id, {
    name: '节点 A',
    workflowId: workflow.id,
  });

  nodeActionService.createNodeAction(workflow.id, {
    mermaidNodeId: 'START',
    actionType: 'prompt',
    targetRef: prompt.id,
  });

  const runtimeService = createWorkflowRuntimeActionsService(
    context.database,
    context.workspacePaths,
    createExternalToolsStub(),
  );

  return {
    context,
    prompt,
    projectNode,
    runtimeService,
  };
}

test('WorkflowRuntimeActionsService 可返回并触发 prompt 类型动作', async () => {
  const fixture = await createPromptRuntimeFixture();

  try {
    const detail = await fixture.runtimeService.getWorkflowRuntimeNodeDetail(fixture.projectNode.id, 'START');
    const triggerResult = await fixture.runtimeService.triggerWorkflowRuntimeNodeAction(
      fixture.projectNode.id,
      'START',
    );

    assert.equal(detail.hasBinding, true);
    assert.deepEqual(detail.action, {
      actionType: 'prompt',
      targetRef: fixture.prompt.id,
      targetName: fixture.prompt.name,
      isExecutable: true,
      failureReason: null,
    });
    assert.deepEqual(triggerResult, {
      actionType: 'prompt',
      promptId: fixture.prompt.id,
      promptName: fixture.prompt.name,
      copyText: 'runtime prompt content',
    });
  } finally {
    await fixture.context.cleanup();
  }
});

test('WorkflowRuntimeActionsService 会把缺失 prompt 文件视为 PromptNotFoundError', async () => {
  const fixture = await createPromptRuntimeFixture();

  try {
    await removePath(
      resolvePromptPath(
        fixture.context.workspacePaths,
        `${fixture.prompt.name}__${fixture.prompt.id.replaceAll('-', '').slice(0, 8)}.md`,
      ),
    );

    const detail = await fixture.runtimeService.getWorkflowRuntimeNodeDetail(fixture.projectNode.id, 'START');

    assert.equal(detail.action?.isExecutable, false);
    assert.equal(detail.action?.failureReason, 'prompt_not_found');

    await assert.rejects(
      async () =>
        fixture.runtimeService.triggerWorkflowRuntimeNodeAction(fixture.projectNode.id, 'START'),
      PromptNotFoundError,
    );
  } finally {
    await fixture.context.cleanup();
  }
});
