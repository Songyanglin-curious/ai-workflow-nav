import type {
  RuntimeFailureReason,
  WorkflowRuntimeNodeDetail,
  WorkflowRuntimeTriggerResult,
} from '../../../../../../shared/workflows/index.js';

export const runtimeActionTypeLabels = {
  prompt: 'Prompt',
  tool: 'Tool',
} as const;

export const runtimeFailureReasonLabels: Record<RuntimeFailureReason, string> = {
  prompt_not_found: '目标 Prompt 不存在或正文文件缺失',
  tool_target_not_found: '目标工具不存在或当前不可执行',
};

export function describeRuntimeFailureReason(reason: RuntimeFailureReason | null | undefined): string {
  if (!reason) {
    return '当前动作可执行。';
  }

  return runtimeFailureReasonLabels[reason];
}

export function describeRuntimeDetail(detail: WorkflowRuntimeNodeDetail | null): string {
  if (!detail) {
    return '先选择一个 Mermaid 节点，再读取当前运行时动作详情。';
  }

  if (!detail.hasBinding || !detail.action) {
    return '当前 Mermaid 节点存在，但还没有配置运行时动作绑定。';
  }

  return detail.action.isExecutable
    ? '当前动作已配置完成，可以直接触发。'
    : describeRuntimeFailureReason(detail.action.failureReason);
}

export function describeRuntimeTriggerResult(result: WorkflowRuntimeTriggerResult | null): string {
  if (!result) {
    return '还没有触发记录。';
  }

  return result.actionType === 'prompt'
    ? `已返回 Prompt 正文，共 ${result.copyText.length} 个字符。`
    : `已请求触发工具 ${result.toolKey}。`;
}

export type { RuntimeFailureReason, WorkflowRuntimeNodeDetail, WorkflowRuntimeTriggerResult };
