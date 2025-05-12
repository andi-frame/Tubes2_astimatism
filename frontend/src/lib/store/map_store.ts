import { create } from "zustand";

type MetaMapType = {
  IdNameMap: Record<number, string>;
  NameIdMap: Record<string, number>;
  NameImgMap: Record<string, string>;
  IdImgMap: Record<number, string>;
  NameTierMap: Record<string, number>;
  IdTierMap: Record<number, number>;
};

type MetaMapStore = {
  metaMap: MetaMapType | null;
  setMetaMap: (data: MetaMapType) => void;
  clearMetaMap: () => void;
};

export const useMetaMapStore = create<MetaMapStore>((set) => ({
  metaMap: null,
  setMetaMap: (data) => set({ metaMap: data }),
  clearMetaMap: () => set({ metaMap: null }),
}));