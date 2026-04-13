export function presentSuccess(data) {
    return presentSuccessWithMeta(data, {});
}
export function presentSuccessWithMeta(data, meta) {
    return {
        success: true,
        data,
        meta,
    };
}
export function presentError(code, message, details) {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
        meta: {},
    };
}
export function presentNamed(key, value) {
    return presentSuccess({
        [key]: value,
    });
}
export function presentNamedData(key, value) {
    return presentNamed(key, value);
}
export function presentResult(value) {
    return presentNamed('result', value);
}
export function presentItems(items) {
    return presentNamed('items', items);
}
//# sourceMappingURL=presenter.js.map