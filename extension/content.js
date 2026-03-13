/* content.js - Keystroke Monitoring Script */

console.log("Comment Guard: Input monitor initialized.");

let typingTimer;
const doneTypingInterval = 800; // Time in ms (0.8 seconds) to wait after user stops typing
let currentTarget = null;

// Instagram and other React apps often use contenteditable divs that don't always fire 'input' normally, 
// or they capture the event differently. We listen to both 'input' and 'keyup' to be safe.

function handleInputEvent(event) {
    let target = event.target || event; // handle both events and elements directly
    if (!target) return;
    
    // Safely handle text nodes
    if (target.nodeType === 3) {
        target = target.parentNode;
    }
    
    // Find the actual editable container
    let editableContainer = target;
    if (editableContainer && !editableContainer.isContentEditable && typeof editableContainer.closest === 'function') {
        const closestContentEditable = editableContainer.closest('[contenteditable="true"], [contenteditable="plaintext-only"], textarea, input[type="text"]');
        if (closestContentEditable) {
            editableContainer = closestContentEditable;
        }
    }

    if (!editableContainer) return;

    // Check if valid input
    const isTextInput = editableContainer.tagName === 'INPUT' && (editableContainer.type === 'text' || editableContainer.type === 'search');
    const isTextArea = editableContainer.tagName === 'TEXTAREA';
    const isContentEditable = editableContainer.isContentEditable || 
                              editableContainer.getAttribute('contenteditable') === 'true' || 
                              editableContainer.getAttribute('contenteditable') === 'plaintext-only';

    if (isTextInput || isTextArea || isContentEditable) {
        clearTimeout(typingTimer);
        currentTarget = editableContainer;
        
        let text = "";
        if (isTextInput || isTextArea) {
            text = editableContainer.value;
        } else if (isContentEditable) {
            // Instagram/Facebook use Draft.js/Lexical which heavily nests text.
            // InnerText is actually better here because it preserves spaces/newlines.
            text = editableContainer.innerText || editableContainer.textContent || "";
        }

        if (text.trim().length > 0) {
            showScanningIndicator(editableContainer);
            
            typingTimer = setTimeout(() => {
                checkTextToxicity(text, editableContainer);
            }, doneTypingInterval);
        } else {
            clearWarning(editableContainer);
        }
    }
}

// 1. Standard event listeners
document.addEventListener('input', handleInputEvent, true);
document.addEventListener('keyup', handleInputEvent, true);
document.addEventListener('paste', handleInputEvent, true);

// 2. MutationObserver (Critical for React/Instagram)
// React often updates the DOM directly without firing standard input events that bubble up
const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
            // If text changed inside a contenteditable, trigger our handler
            let target = mutation.target;
            if (target.nodeType === 3) target = target.parentNode; // Get element from text node
            
            if (target && typeof target.closest === 'function' && target.closest('[contenteditable="true"], [contenteditable="plaintext-only"]')) {
                handleInputEvent({ target: target });
                break; // Only need to trigger once per batch of mutations
            }
        }
    }
});

// Start observing the entire body for changes
observer.observe(document.body, { 
    characterData: true, 
    childList: true, 
    subtree: true 
});

function showScanningIndicator(element) {
    if (!element.dataset.cgScanning) {
        element.dataset.cgScanning = "true";
        element.style.setProperty('box-shadow', 'inset 0 0 0 2px #facc15', 'important'); // Yellow border while typing
    }
}


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
    
    if (element.dataset.cgScanning) {
        delete element.dataset.cgScanning;
    }
    
    if (element.dataset.cgTooltip) {
        const tooltip = document.getElementById(element.dataset.cgTooltip);
        if (tooltip) {
            tooltip.remove();
        }
        delete element.dataset.cgTooltip;
    }
}
