import type {
  GenderType,
  StatusType,
  HowKnowUsType,
} from "@economic-control/shared";
import type { UserType } from "@economic-control/shared";

export {
  STATUS,
  type StatusType,
  GENDER,
  type GenderType,
} from "@economic-control/shared";

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  gender: GenderType;
  birth_date: string;
  status: StatusType;
  visit_date: string | null;
  user_id: number;
  is_visible: boolean;
  User?: UserType;
  how_know_us?: HowKnowUsType | null;
  invited_by?: string | null;
}

export type MemberAttributes = Member;
