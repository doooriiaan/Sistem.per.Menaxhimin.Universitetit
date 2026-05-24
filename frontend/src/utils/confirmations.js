export const confirmDelete = (target = "kete element") => {
  if (typeof window === "undefined") {
    return true;
  }

  return window.confirm(
    `A je i sigurt qe deshiron ta fshish ${target}? Ky veprim nuk mund te kthehet.`
  );
};
