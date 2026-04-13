import { presentSuccess } from '../presenter.js';
export function presentPromptListResponse(items) {
    return {
        items,
    };
}
export function presentPromptDetailResponse(prompt) {
    return {
        prompt,
    };
}
export function presentPromptDeleteResponse() {
    return {
        result: {
            deleted: true,
        },
    };
}
export function presentPromptListEnvelope(items) {
    return presentSuccess(presentPromptListResponse(items));
}
export function presentPromptDetailEnvelope(prompt) {
    return presentSuccess(presentPromptDetailResponse(prompt));
}
export function presentPromptDeleteEnvelope() {
    return presentSuccess(presentPromptDeleteResponse());
}
//# sourceMappingURL=prompts.js.map