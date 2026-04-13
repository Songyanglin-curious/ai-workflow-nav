import { access, readFile } from 'node:fs/promises';
import { parse } from 'jsonc-parser';
import { ConfigFileNotFoundError, ConfigParseError, ConfigValidationError } from './errors.js';
import { localConfigSchema } from './schema.js';
export async function readConfigText(configPath) {
    try {
        await access(configPath);
    }
    catch {
        throw new ConfigFileNotFoundError(configPath);
    }
    return readFile(configPath, 'utf8');
}
export function parseConfigText(configPath, sourceText) {
    try {
        return parse(sourceText);
    }
    catch (error) {
        throw new ConfigParseError(configPath, error);
    }
}
export async function loadLocalConfig(configPath) {
    const sourceText = await readConfigText(configPath);
    const parsedConfig = parseConfigText(configPath, sourceText);
    const parsedResult = localConfigSchema.safeParse(parsedConfig);
    if (!parsedResult.success) {
        throw new ConfigValidationError(configPath, parsedResult.error);
    }
    return parsedResult.data;
}
//# sourceMappingURL=config.js.map