/** Nota coperto nel menu pubblico: solo se valorizzata per questo menu. */
export function getMenuFooterCoverNoteIt(
  footerNoteIt?: string | null
): string | null {
  const note = footerNoteIt?.trim();
  return note || null;
}
