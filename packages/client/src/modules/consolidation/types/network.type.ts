import type { NetworkCreationRequest } from "@economic-control/shared";

export interface Network extends NetworkCreationRequest {
  id: number;
}

export type NetworkType = Network;
