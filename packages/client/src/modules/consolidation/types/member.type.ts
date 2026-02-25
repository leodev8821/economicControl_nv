import type { MemberCreationRequest } from "@economic-control/shared";
export {
  STATUS,
  type StatusType,
  GENDER,
  type GenderType,
} from "@economic-control/shared";

export interface Member extends MemberCreationRequest {
  id: number;
  User?: {
    id: number;
    first_name: string;
    username: string;
  };
}

export type MemberAttributes = Member;
