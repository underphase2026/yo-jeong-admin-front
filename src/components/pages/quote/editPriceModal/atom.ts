import { atom } from "jotai";

interface EditPriceModalState {
  isOpen: boolean;
  phoneBrand: string; // 추가됨
  telecom: string;
  device: string;
  originalPrice: number;
  commonDiscount: number;
  option: {
    type: string;
    plan: string;
    price: number;
  } | null;
}

export const editPriceModalAtom = atom<EditPriceModalState>({
  isOpen: false,
  phoneBrand: "",
  telecom: "",
  device: "",
  originalPrice: 0,
  commonDiscount: 0,
  option: null,
});

export const EditPriceModalOpenAtom = atom(
  null,
  (_, set, payload: Omit<EditPriceModalState, "isOpen">) => {
    set(editPriceModalAtom, {
      isOpen: true,
      ...payload,
    });
  },
);

export const EditPriceModalCloseAtom = atom(null, (_, set) => {
  set(editPriceModalAtom, {
    isOpen: false,
    phoneBrand: "",
    telecom: "",
    device: "",
    originalPrice: 0,
    commonDiscount: 0,
    option: null,
  });
});
