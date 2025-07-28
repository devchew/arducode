// @ts-check

// Script run within the webview itself.
(function () {
  // Get a reference to the VS Code webview api.
  // We use this API to post messages back to our extension.

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const notesContainer = /** @type {HTMLElement} */ (
    document.querySelector(".notes")
  );

  const textarea = document.createElement("textarea");
  notesContainer.appendChild(textarea);

  textarea.onkeyup = () => {
    vscode.postMessage({
      type: "change",
      text: textarea.value || "",
    });
  };

  /**
   * Render the document in the webview.
   */
  function updateContent(/** @type {string} */ text) {
    textarea.value = text || "";
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "update":
        const text = message.text;

        // Update our webview's content
        updateContent(text);

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ text });

        return;
    }
  });

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState();
  if (state) {
    updateContent(state.text);
  }
})();
