import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContext } from '../../../test/test-context.js';
import { createPromptService } from '../../../domains/prompts/service.js';
import { PromptNotFoundError } from '../../../domains/prompts/errors.js';
import { createWorkflowService } from '../service.js';
import { createWorkflowNodeActionService } from './service.js';

test('WorkflowNodeActionService 会在 Mermaid 变更后清理失效绑定', async () => {
  const context = await createTestContext();

  try {
    const promptService = createPromptService(context.database, context.workspacePaths);
    const workflowService = createWorkflowService(context.database);
    const nodeActionService = createWorkflowNodeActionService(context.database);
    const prompt = await promptService.createPrompt({
      name: '节点动作提示词',
      content: 'copy text',
    });
    const workflow = workflowService.createWorkflow({
      name: '工作流 A',
      mermaidSource: 'flowchart TD\nSTART[开始]\nEND[结束]\nSTART --> END',
    });

    nodeActionService.createNodeAction(workflow.id, {
      mermaidNodeId: 'START',
      actionType: 'prompt',
      targetRef: prompt.id,
    });

    const updateResult = workflowService.updateWorkflow(workflow.id, {
      mermaidSource: 'flowchart TD\nEND[结束]',
    });
    const remainingBindings = nodeActionService.listNodeActionsByWorkflowId(workflow.id);

    assert.deepEqual(updateResult.bindingSync, {
      removedCount: 1,
      remainingCount: 0,
    });
    assert.equal(remainingBindings.length, 0);
  } finally {
    await context.cleanup();
  }
});

test('WorkflowNodeActionService 会复用 PromptNotFoundError', async () => {
  const context = await createTestContext();

  try {
    const workflowService = createWorkflowService(context.database);
    const nodeActionService = createWorkflowNodeActionService(context.database);
    const workflow = workflowService.createWorkflow({
      name: '工作流 B',
      mermaidSource: 'flowchart TD\nSTART[开始]',
    });

    assert.throws(
      () =>
        nodeActionService.createNodeAction(workflow.id, {
          mermaidNodeId: 'START',
          actionType: 'prompt',
          targetRef: 'missing-prompt-id',
        }),
      PromptNotFoundError,
    );
  } finally {
    await context.cleanup();
  }
});
