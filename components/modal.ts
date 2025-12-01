
export const renderModal = (title: string, formHTML: string, submitId: string) => {
    const modalHTML = `
        <div class="modal-overlay visible" id="modal-overlay">
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div class="modal-header">
                    <h2 id="modal-title">${title}</h2>
                    <button class="modal-close-btn" aria-label="Close dialog">&times;</button>
                </div>
                <form id="modal-form">
                    <div class="modal-body">${formHTML}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary modal-close-btn">Cancel</button>
                        <button type="submit" id="${submitId}" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modal-container')!.innerHTML = modalHTML;
};

export const closeModal = () => {
    document.getElementById('modal-container')!.innerHTML = '';
};
