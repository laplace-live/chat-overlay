// Type guard to check if element is HTMLInputElement
function isInputElement(element: Element): element is HTMLInputElement {
  return element.tagName === 'INPUT'
}

// Type guard to check if element is HTMLTextAreaElement
function isTextAreaElement(element: Element): element is HTMLTextAreaElement {
  return element.tagName === 'TEXTAREA'
}

// Type guard to check if element is editable (input or textarea)
function isEditableElement(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
  return isInputElement(element) || isTextAreaElement(element)
}

// Context menu setup for input and textarea elements
export function setupContextMenu() {
  // Add contextmenu event listener to the document
  document.addEventListener('contextmenu', e => {
    e.preventDefault()

    const target = e.target
    if (!(target instanceof Element)) {
      return
    }

    const isEditable = isEditableElement(target)

    if (!isEditable && !window.getSelection()?.toString()) {
      // Don't show context menu if not on an editable element and no text is selected
      return
    }

    let selectionText = ''
    let inputType = ''

    if (isEditableElement(target)) {
      selectionText = target.value.substring(target.selectionStart || 0, target.selectionEnd || 0)
      inputType = isInputElement(target) ? target.type : 'textarea'
    } else {
      // Get selected text from the page
      selectionText = window.getSelection()?.toString() || ''
    }

    // Show the context menu
    window.electronAPI.showContextMenu({
      selectionText,
      isEditable,
      inputType,
    })
  })
}
