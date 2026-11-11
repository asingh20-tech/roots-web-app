// Tells screens that keep their own copy of the tree list (the toolbar's
// tree switcher, My Trees) that a tree was renamed or deleted, so they
// re-read it from Django instead of showing stale names or a deleted tree.
type Listener = () => void;

const listeners = new Set<Listener>();

export const onTreesChanged = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notifyTreesChanged = (): void => {
  listeners.forEach((listener) => listener());
};
