// toast.js - Toast notification system
export const showToast = (message, type = 'info', duration = 5000) => {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Toast styles
    const baseStyles = `
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        position: relative;
        overflow: hidden;
    `;
    
    // Type-specific styles and icons
    const typeConfig = {
        success: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            icon: 'fa-check-circle'
        },
        error: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            icon: 'fa-times-circle'
        },
        warning: {
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            icon: 'fa-exclamation-triangle'
        },
        info: {
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            icon: 'fa-info-circle'
        }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    toast.style.cssText = baseStyles + `background: ${config.background};`;
    
    toast.innerHTML = `
        <i class="fa-solid ${config.icon}" style="font-size: 1.2rem;"></i>
        <span style="flex: 1;">${message}</span>
        <button class="toast-close" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            opacity: 0.8;
            transition: opacity 0.2s;
        ">
            <i class="fa-solid fa-times"></i>
        </button>
    `;
    
    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.8');
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }
    
    return toast;
};

const removeToast = (toast) => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
};

// Specific notification types for leave system
export const showLeaveApprovalToast = (leaveType, leaveId) => {
    showToast(
        `✅ Your ${leaveType} request (${leaveId}) has been approved!`,
        'success',
        6000
    );
};

export const showLeaveRejectionToast = (leaveType, leaveId, reason = '') => {
    const message = reason 
        ? `❌ Your ${leaveType} request (${leaveId}) was rejected. Reason: ${reason}`
        : `❌ Your ${leaveType} request (${leaveId}) was rejected.`;
    
    showToast(message, 'error', 8000);
};

export const showLeaveApplicationToast = (leaveType, days) => {
    showToast(
        `📝 Leave application submitted: ${leaveType} for ${days} day${days > 1 ? 's' : ''}`,
        'info',
        4000
    );
};
