import type {
  NetworkType,
  NetworkCreationRequest,
  NetworkUpdateRequest,
} from "@economic-control/shared";

export interface Network extends NetworkType {
  id: number;
}

export type NetworkAttributes = Network;
export type NetworkCreate = NetworkCreationRequest;
export type NetworkUpdate = NetworkUpdateRequest;
