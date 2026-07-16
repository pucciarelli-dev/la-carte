import { useCallback, useRef } from "react";

export function useMenuAutosave<T>(
  initialData: T,
  getData: () => T,
  serialize: (data: T) => string
) {
  const savedSnapshotRef = useRef(serialize(initialData));
  const getDataRef = useRef(getData);
  getDataRef.current = getData;

  const hasChanges = useCallback(() => {
    return serialize(getDataRef.current()) !== savedSnapshotRef.current;
  }, [serialize]);

  const markSaved = useCallback(() => {
    savedSnapshotRef.current = serialize(getDataRef.current());
  }, [serialize]);

  return { hasChanges, markSaved };
}
