export const toolActionTypeValues = ['openFile', 'openFolder', 'openPath', 'openAtLine'];
export class ToolRegistry {
    version;
    defaults;
    routes;
    security;
    #tools;
    constructor(source) {
        this.version = source.version;
        this.defaults = source.defaults;
        this.routes = source.routes ?? [];
        this.security = source.security;
        this.#tools = new Map(source.tools.map((tool) => [tool.toolKey, tool]));
    }
    getToolByKey(toolKey) {
        return this.#tools.get(toolKey);
    }
    toolExists(toolKey) {
        return this.#tools.has(toolKey);
    }
    listTools() {
        return Array.from(this.#tools.values());
    }
    findRouteByExtension(extension, actionType) {
        return this.routes.find((route) => {
            if (route.match.extension !== extension) {
                return false;
            }
            if (!actionType) {
                return true;
            }
            return route.actionType === actionType;
        });
    }
}
export function createToolRegistry(source) {
    return new ToolRegistry(source);
}
//# sourceMappingURL=registry.js.map