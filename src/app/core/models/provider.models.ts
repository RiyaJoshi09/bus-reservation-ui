/** Assumed values; confirm against your Java AgreementStatus enum. */
export type AgreementStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';

export interface ProviderRegisterRequest {
  companyName: string;
  companyEmail: string;
  pnrRegex: string;
}

export interface ProviderApproval {
  agreementStatus: AgreementStatus;
}

export interface ProviderResponse {
  id: string; // UUID travels as a string
  companyName: string;
  agreementStatus: string;
}