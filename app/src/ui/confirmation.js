// App-owned confirmation keeps the owner decision explicit and keyboard accessible.
export function confirmArchive(message) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "archive-confirm";
    const text = document.createElement("p");
    text.textContent = message;
    const cancel = document.createElement("button");
    cancel.textContent = "Vazgeç";
    const accept = document.createElement("button");
    accept.textContent = "Onayla ve arşivle";
    const finish = (value) => {
      dialog.close();
      dialog.remove();
      resolve(value);
    };
    cancel.addEventListener("click", () => finish(false));
    accept.addEventListener("click", () => finish(true));
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finish(false);
    });
    dialog.append(text, cancel, accept);
    document.body.append(dialog);
    dialog.showModal();
    cancel.focus();
  });
}
