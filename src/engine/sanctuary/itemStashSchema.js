const DEFAULT_ITEM_STASH_CONTAINER_ID = "sanctuary-stash-base";

function createDefaultContainer() {
  return {
    id: DEFAULT_ITEM_STASH_CONTAINER_ID,
    label: "Stash",
    kind: "extracted_items",
    unlocked: true,
    order: 0,
    itemIds: [],
  };
}

export function createEmptyItemStashState() {
  return {
    version: 1,
    activeContainerId: DEFAULT_ITEM_STASH_CONTAINER_ID,
    containers: [createDefaultContainer()],
  };
}

function normalizeContainer(container = {}) {
  if (!container?.id) return null;
  return {
    ...createDefaultContainer(),
    ...container,
    id: String(container.id),
    label: container?.label ? String(container.label) : createDefaultContainer().label,
    kind: container?.kind || "extracted_items",
    unlocked: container?.unlocked !== false,
    order: Math.max(0, Number(container?.order || 0)),
    itemIds: Array.isArray(container?.itemIds) ? container.itemIds.map(id => String(id)).filter(Boolean) : [],
  };
}

export function syncItemStashState(stashState = {}, extractedItems = []) {
  const validItemIds = [...new Set((Array.isArray(extractedItems) ? extractedItems : []).map(item => item?.id).filter(Boolean).map(String))];
  const validItemIdSet = new Set(validItemIds);
  const baseState = createEmptyItemStashState();
  const rawContainers = Array.isArray(stashState?.containers) ? stashState.containers : [];
  const normalizedContainers = rawContainers
    .map(normalizeContainer)
    .filter(Boolean)
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0));

  const containers = normalizedContainers.length > 0 ? normalizedContainers : baseState.containers;
  const seenIds = new Set();
  const nextContainers = containers.map((container, index) => {
    const nextItemIds = container.itemIds.filter(itemId => {
      if (!validItemIdSet.has(itemId) || seenIds.has(itemId)) return false;
      seenIds.add(itemId);
      return true;
    });
    return {
      ...createDefaultContainer(),
      ...container,
      order: index,
      itemIds: nextItemIds,
    };
  });

  const unassignedItemIds = validItemIds.filter(itemId => !seenIds.has(itemId));
  const targetContainerIndex = Math.max(
    0,
    nextContainers.findIndex(container => container.id === (stashState?.activeContainerId || baseState.activeContainerId))
  );
  nextContainers[targetContainerIndex] = {
    ...nextContainers[targetContainerIndex],
    itemIds: [...nextContainers[targetContainerIndex].itemIds, ...unassignedItemIds],
  };

  const activeContainerId = nextContainers.some(container => container.id === stashState?.activeContainerId)
    ? stashState.activeContainerId
    : nextContainers[0]?.id || baseState.activeContainerId;

  return {
    ...baseState,
    ...stashState,
    activeContainerId,
    containers: nextContainers,
  };
}
