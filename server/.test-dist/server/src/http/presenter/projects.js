import { presentItems, presentNamedData, presentResult } from '../presenter.js';
export function presentProjectListEnvelope(items) {
    return presentItems(items);
}
export function presentProjectDetailEnvelope(project) {
    return presentNamedData('project', project);
}
export function presentProjectNodeListEnvelope(items) {
    return presentItems(items);
}
export function presentProjectNodeDetailEnvelope(projectNode) {
    return presentNamedData('projectNode', projectNode);
}
export function presentProjectNodeLayoutsEnvelope(items) {
    return presentItems(items);
}
export function presentProjectNodeLayoutsPatchEnvelope(result) {
    return presentResult(result);
}
export function presentProjectViewportEnvelope(viewport) {
    return presentNamedData('viewport', viewport);
}
export function presentDeliberationsFolderEnvelope(result) {
    return presentNamedData('folder', result);
}
export function presentDeliberationsFilesEnvelope(items) {
    return presentItems(items);
}
export function presentAppendLatestDeliberationsEnvelope(result) {
    return presentResult(result);
}
export function presentCreateDeliberationsFileEnvelope(result) {
    return presentResult(result);
}
export function presentSummaryFolderEnvelope(summary) {
    return presentNamedData('summary', summary);
}
export function presentSummaryFilesEnvelope(items) {
    return presentItems(items);
}
export function presentProjectDeletionCheckEnvelope(result) {
    return presentResult(result);
}
export function presentProjectDeletionExecuteEnvelope(result) {
    return presentResult(result);
}
export function presentProjectNodeDeletionCheckEnvelope(result) {
    return presentResult(result);
}
export function presentProjectNodeDeletionExecuteEnvelope(result) {
    return presentResult(result);
}
export function presentWorkflowRuntimeDetailEnvelope(result) {
    return presentResult(result);
}
export function presentWorkflowRuntimeTriggerEnvelope(result) {
    return presentResult(result);
}
//# sourceMappingURL=projects.js.map