type Listener = () => void;

let hoveredHutId: number | null = null;
const hutListeners = new Map<number, Set<Listener>>();
const globalListeners = new Set<Listener>();

function notifyHut(hutId: number) {
  hutListeners.get(hutId)?.forEach((listener) => listener());
}

function notifyGlobal() {
  globalListeners.forEach((listener) => listener());
}

export function getHoveredHutId(): number | null {
  return hoveredHutId;
}

export function setHoveredHutId(id: number | null): void {
  const prev = hoveredHutId;
  if (prev === id) return;
  hoveredHutId = id;
  if (prev !== null) notifyHut(prev);
  if (id !== null) notifyHut(id);
  notifyGlobal();
}

export function subscribeHoveredHut(hutId: number, listener: Listener): () => void {
  let set = hutListeners.get(hutId);
  if (!set) {
    set = new Set();
    hutListeners.set(hutId, set);
  }
  set.add(listener);
  return () => set!.delete(listener);
}

export function subscribeHoverGlobal(listener: Listener): () => void {
  globalListeners.add(listener);
  return () => globalListeners.delete(listener);
}
