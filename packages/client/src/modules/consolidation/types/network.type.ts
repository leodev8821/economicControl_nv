import type {
  NetworkType,
  NetworkCreationDTO,
  NetworkUpdateDTO,
} from "@economic-control/shared";

export interface Network extends NetworkType {
  id: number;
}

export type NetworkAttributes = Network;
export type NetworkCreate = NetworkCreationDTO;
export type NetworkUpdate = NetworkUpdateDTO;
