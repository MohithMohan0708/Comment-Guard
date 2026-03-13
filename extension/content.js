/* content.js - Keystroke Monitoring Script */

console.log("Comment Guard: Input monitor initialized.");

let typingTimer;
const doneTypingInterval = 800; // Time in ms (0.8 seconds) to wait after user stops typing
let currentTarget = null;

// Instagram and other React apps often use contenteditable divs that don't always fire 'input' normally, 
// or they capture the event differently. We listen to both 'input' and 'keyup' to be safe.

function handleInputEvent(event) {
    let target = event.target;
    if (!target) return;
    
    // Safely handle text nodes (sometimes events fire directly on text nodes in certain browsers/editors)
    if (target.nodeType === 3) { // Node.TEXT_NODE
        target = target.parentNode;
    }
    
    // We need to look up the tree to find the actual contenteditable container
    // Instagram uses deeply nested <span> inside <p> inside <div contenteditable="true">
    let editableContainer = target;
    if (editableContainer && !editableContainer.isContentEditable && typeof editableContainer.closest === 'function') {
        const closestContentEditable = editableContainer.closest('[contenteditable="true"], [contenteditable="plaintext-only"]');
        if (closestContentEditable) {
            editableContainer = closestContentEditable;
        }
    }

    if (!editableContainer) return;

    // Check if the resolved container is an input field, textarea, or contenteditable
    const isTextInput = editableContainer.tagName === 'INPUT' && (editableContainer.type === 'text' || editableContainer.type === 'search');
    const isTextArea = editableContainer.tagName === 'TEXTAREA';
    const isContentEditable = editableContainer.isContentEditable || 
                              editableContainer.getAttribute('contenteditable') === 'true' || 
                              editableContainer.getAttribute('contenteditable') === 'plaintext-only';

    if (isTextInput || isTextArea || isContentEditable) {
        clearTimeout(typingTimer);
        currentTarget = editableContainer;
        
        // Extract text depending on the element type
        let text = "";
        if (isTextInput || isTextArea) {
            text = editableContainer.value;
        } else if (isContentEditable) {
            // textContent safely grabs all text from nested spans/p-tags
            text = editableContainer.textContent || editableContainer.innerText || "";
        }

        if (text.trim().length > 0) {
            // Wait until the user stops typing
            typingTimer = setTimeout(() => {
                checkTextToxicity(text, editableContainer);
            }, doneTypingInterval);
        } else {
            // Clear warnings if input is empty
            clearWarning(editableContainer);
        }
    }
}

// React sites heavily intercept 'input' and 'change', but 'keyup' almost always bubbles up reliably.
document.addEventListener('input', handleInputEvent, true);
document.addEventListener('keyup', handleInputEvent, true);
document.addEventListener('paste', handleInputEvent, true);


function checkTextToxicity(text, element) {
    // Send message to background script to check the text
    chrome.runtime.sendMessage(
        { action: "checkComment", text: text },
        (response) => {
            if (chrome.runtime.lastError) {
                console.error("Comment Guard Error:", chrome.runtime.lastError.message);
                return;
            }

            if (response && response.success) {
                if (response.data.is_toxic) {
                    showWarning(element);
                } else {
                    clearWarning(element);
                }
            }
        }
    );
}

function showWarning(element) {
    // Apply inline styles to ensure we override website CSS
    element.style.setProperty('box-shadow', 'inset 0 0 0 2px red, 0 0 8px rgba(255, 0, 0, 0.5)', 'important');
    element.style.setProperty('background-color', 'rgba(255, 0, 0, 0.05)', 'important');
    element.style.setProperty('transition', 'all 0.3s ease', 'important');
    element.style.setProperty('outline', 'none', 'important');
    
    // Check if warning tooltip already exists
    let tooltipId = "cg-warning-" + Math.random().toString(36).substr(2, 9);
    if (!element.dataset.cgTooltip) {
        element.dataset.cgTooltip = tooltipId;
        
        const tooltip = document.createElement("div");
        tooltip.id = tooltipId;
        tooltip.className = "comment-guard-tooltip";
        tooltip.innerText = "🚨 Toxic content detected!";
        
        // Position it right above the input
        const rect = element.getBoundingClientRect();
        tooltip.style.position = "absolute";
        // Put it slightly above and to the left
        tooltip.style.top = Math.max(0, (window.scrollY + rect.top - 35)) + "px";
        tooltip.style.left = (window.scrollX + rect.left) + "px";
        tooltip.style.zIndex = "999999999";
        
        document.body.appendChild(tooltip);
    }
}

function clearWarning(element) {
    element.style.removeProperty('box-shadow');
    element.style.removeProperty('background-color');
    element.style.removeProperty('transition');
    element.style.removeProperty('outline');
    
    if (element.dataset.cgTooltip) {
        const tooltip = document.getElementById(element.dataset.cgTooltip);
        if (tooltip) {
            tooltip.remove();
        }
        delete element.dataset.cgTooltip;
    }
}
