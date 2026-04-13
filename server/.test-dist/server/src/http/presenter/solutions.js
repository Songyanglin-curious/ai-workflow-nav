import { presentItems, presentNamedData, presentResult } from '../presenter.js';
export function presentSolutionListEnvelope(items) {
    return presentItems(items);
}
export function presentSolutionDetailEnvelope(solution) {
    return presentNamedData('solution', solution);
}
export function presentSolutionDeleteEnvelope() {
    return presentResult({
        deleted: true,
    });
}
export function presentSolutionProjectsEnvelope(items) {
    return presentItems(items);
}
export function presentProjectSolutionsEnvelope(items) {
    return presentItems(items);
}
//# sourceMappingURL=solutions.js.map