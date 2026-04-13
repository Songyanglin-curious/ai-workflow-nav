import { ImportsExportsValidationError } from './errors.js';
export function stringifyCsvField(value) {
    return `"${value.replaceAll('"', '""')}"`;
}
export function stringifyCsvRows(rows) {
    return rows.map((row) => row.map(stringifyCsvField).join(',')).join('\n');
}
export function parseCsv(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let cursor = 0;
    let inQuotes = false;
    function pushField() {
        currentRow.push(currentField);
        currentField = '';
    }
    function pushRow() {
        rows.push(currentRow);
        currentRow = [];
    }
    while (cursor < text.length) {
        const character = text[cursor];
        const nextCharacter = text[cursor + 1];
        if (inQuotes) {
            if (character === '"') {
                if (nextCharacter === '"') {
                    currentField += '"';
                    cursor += 2;
                    continue;
                }
                inQuotes = false;
                cursor += 1;
                continue;
            }
            currentField += character;
            cursor += 1;
            continue;
        }
        if (character === '"') {
            if (currentField.length !== 0) {
                throw new ImportsExportsValidationError('CSV 内容非法：引号必须出现在字段开头。');
            }
            inQuotes = true;
            cursor += 1;
            continue;
        }
        if (character === ',') {
            pushField();
            cursor += 1;
            continue;
        }
        if (character === '\r' || character === '\n') {
            pushField();
            pushRow();
            if (character === '\r' && nextCharacter === '\n') {
                cursor += 2;
            }
            else {
                cursor += 1;
            }
            continue;
        }
        currentField += character;
        cursor += 1;
    }
    if (inQuotes) {
        throw new ImportsExportsValidationError('CSV 内容非法：存在未闭合的引号。');
    }
    if (currentField.length > 0 || currentRow.length > 0 || text.endsWith(',') || text.endsWith('\n') || text.endsWith('\r')) {
        pushField();
        pushRow();
    }
    return rows.filter((row) => row.length > 1 || row[0] !== '');
}
export function parseCsvRecords(text, expectedHeaders) {
    const rows = parseCsv(text);
    if (rows.length === 0) {
        throw new ImportsExportsValidationError('CSV 内容非法：缺少表头。');
    }
    const [headers, ...dataRows] = rows;
    if (headers.length !== expectedHeaders.length || headers.some((header, index) => header !== expectedHeaders[index])) {
        throw new ImportsExportsValidationError(`CSV 表头不匹配：${expectedHeaders.join(', ')}`);
    }
    return dataRows.map((row, rowIndex) => {
        if (row.length !== headers.length) {
            throw new ImportsExportsValidationError(`CSV 第 ${rowIndex + 2} 行列数不匹配。`);
        }
        return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
    });
}
//# sourceMappingURL=csv.js.map