import { presentItems, presentNamed } from '../presenter.js';
export function createSummariesHttpHandlers({ summaries, }) {
    return {
        async getSummaryFolder(request, reply) {
            const summary = await summaries.getSummaryFolderInfo(request.params.projectNodeId);
            await reply.send(presentNamed('summary', summary));
        },
        async listSummaryFiles(request, reply) {
            const items = await summaries.listSummaryFiles(request.params.projectNodeId);
            await reply.send(presentItems(items));
        },
    };
}
//# sourceMappingURL=summaries.js.map