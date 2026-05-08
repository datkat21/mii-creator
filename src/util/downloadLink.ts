export function downloadLink(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    a.remove();
  }, 1000);
}

const link = document.createElement("a");
export function saveBlob(blob: Blob, filename: string) {
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }

  link.href = URL.createObjectURL(blob);
  link.download = filename || "data.json";
  link.dispatchEvent(new MouseEvent("click"));
}

export function saveArrayBuffer(buffer: any, filename: string) {
  saveBlob(new Blob([buffer], { type: "application/octet-stream" }), filename);
}

export function saveString(text: string, filename: string) {
  saveBlob(new Blob([text], { type: "text/plain" }), filename);
}
