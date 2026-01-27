
export const getPageContentHTML = (title: string, content: string, controls: string = '') => `
    <div class="page-header">
        <h1>${title}</h1>
        <div class="page-header-actions">${controls}</div>
    </div>
    <div class="page-body">
        ${content}
    </div>
`;
