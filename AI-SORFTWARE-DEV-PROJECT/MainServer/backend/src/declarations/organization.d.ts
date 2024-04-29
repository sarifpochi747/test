import { Status } from "./status";

declare interface OrganizationData {
  email: string;
  organizationId?: string;
  organizationName?: string;
  address?: string;
  phone?: string;
  organizeStatus?: Status;

}
