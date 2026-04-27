const MAX_UPLOAD_SIZE = 6 * 1024 * 1024;

export const ACCEPTED_UPLOAD_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const fileToPayload = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Skedari mungon."));
      return;
    }

    if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
      reject(new Error("Lejohen vetem PDF, JPG, PNG ose WEBP."));
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      reject(new Error("Skedari duhet te jete maksimalisht 6MB."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl: reader.result,
      });
    };

    reader.onerror = () => {
      reject(new Error("Skedari nuk mund te lexohet."));
    };

    reader.readAsDataURL(file);
  });
