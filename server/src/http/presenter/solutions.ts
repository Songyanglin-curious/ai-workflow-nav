import { presentItems, presentNamedData, presentResult } from '../presenter.js';
import type {
  ProjectSolutionItem,
  SolutionDetail,
  SolutionProjectItem,
  SolutionSummary,
} from '../../domains/solutions/service.js';

export function presentSolutionListEnvelope(items: SolutionSummary[]) {
  return presentItems(items);
}

export function presentSolutionDetailEnvelope(solution: SolutionDetail) {
  return presentNamedData('solution', solution);
}

export function presentSolutionDeleteEnvelope() {
  return presentResult({
    deleted: true as const,
  });
}

export function presentSolutionProjectsEnvelope(items: SolutionProjectItem[]) {
  return presentItems(items);
}

export function presentProjectSolutionsEnvelope(items: ProjectSolutionItem[]) {
  return presentItems(items);
}
