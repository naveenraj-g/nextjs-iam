import { create } from "zustand";
import { TOAuthClient } from "../types/oauthclient.type";

export type ModalType =
  | "createOAuthClient"
  | "editOAuthClient"
  | "deleteOAuthClient"
  | "rotateClientSecret"
  | "createUser"
  | "updateUser"
  | "setRole"
  | "banUser"
  | "removeUser"
  | "setUserPassword"
  | "revokeUserSessions"
  | "impersonateUser"
  | "revokeSession"
  | "revokeAllSessions";

export interface ModalData {
  // Users
  userId?: string;
  userName?: string;
  userEmail?: string;
  userImage?: string | null;
  currentRole?: string | null;
  isBanned?: boolean;
  // OAuth Clients
  clientId?: string;
  clientName?: string;
  oauthClient?: TOAuthClient;
  // Sessions
  sessionToken?: string;
  sessionIp?: string | null;
  sessionUserAgent?: string | null;
}

interface IAdminStore {
  type: ModalType | null;
  isOpen: boolean;
  trigger: number;
  triggerInModal: number;
  data: ModalData | null;
  incrementTrigger: () => void;
  incrementInModalTrigger: () => void;
  onOpen: (props: { type: ModalType; data?: ModalData }) => void;
  onClose: () => void;
}

const _useAdminStore = create<IAdminStore>((set) => ({
  type: null,
  isOpen: false,
  trigger: 0,
  triggerInModal: 0,
  data: null,
  onOpen: ({ type, data }) =>
    set({
      isOpen: true,
      type,
      data: data ?? null,
    }),
  onClose: () =>
    set({
      type: null,
      isOpen: false,
      trigger: 0,
      triggerInModal: 0,
      data: null,
    }),
  incrementTrigger: () => set((state) => ({ trigger: state.trigger + 1 })),
  incrementInModalTrigger: () =>
    set((state) => ({ triggerInModal: state.triggerInModal + 1 })),
}));

export const useAdminStore = _useAdminStore;
export const adminStore = _useAdminStore;
