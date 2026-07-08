"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { models, type ModelDef } from "@/app/data/model";

interface ModelSelectionCtx {
  selectedModelIds: string[];
  selectedModelIdSet: ReadonlySet<string>;
  visibleModels: ModelDef[];
  allModelIds: string[];
  selectedCount: number;
  totalCount: number;
  isSelected: (id: string) => boolean;
  setSelectedModelIds: (ids: string[]) => void;
  toggleModel: (id: string) => void;
  selectAllModels: () => void;
  clearModels: () => void;
}

const ALL_MODEL_IDS = models.map((model) => model.id);
const Ctx = createContext<ModelSelectionCtx | null>(null);

function normalizeModelIds(ids: string[]): string[] {
  const allowed = new Set(ALL_MODEL_IDS);
  const seen = new Set<string>();
  return ids.filter((id) => {
    if (!allowed.has(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function ModelSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedModelIds, setSelectedModelIdsState] = useState<string[]>(ALL_MODEL_IDS);

  const value = useMemo<ModelSelectionCtx>(() => {
    const selectedModelIdSet = new Set(selectedModelIds);
    const setSelectedModelIds = (ids: string[]) => setSelectedModelIdsState(normalizeModelIds(ids));
    return {
      selectedModelIds,
      selectedModelIdSet,
      visibleModels: models.filter((model) => selectedModelIdSet.has(model.id)),
      allModelIds: ALL_MODEL_IDS,
      selectedCount: selectedModelIds.length,
      totalCount: ALL_MODEL_IDS.length,
      isSelected: (id: string) => selectedModelIdSet.has(id),
      setSelectedModelIds,
      toggleModel: (id: string) => {
        setSelectedModelIdsState((current) =>
          current.includes(id) ? current.filter((modelId) => modelId !== id) : normalizeModelIds([...current, id]),
        );
      },
      selectAllModels: () => setSelectedModelIdsState(ALL_MODEL_IDS),
      clearModels: () => setSelectedModelIdsState([]),
    };
  }, [selectedModelIds]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useModelSelection(): ModelSelectionCtx {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  const selectedModelIdSet = new Set(ALL_MODEL_IDS);
  return {
    selectedModelIds: ALL_MODEL_IDS,
    selectedModelIdSet,
    visibleModels: models,
    allModelIds: ALL_MODEL_IDS,
    selectedCount: ALL_MODEL_IDS.length,
    totalCount: ALL_MODEL_IDS.length,
    isSelected: (id: string) => selectedModelIdSet.has(id),
    setSelectedModelIds: () => {},
    toggleModel: () => {},
    selectAllModels: () => {},
    clearModels: () => {},
  };
}
