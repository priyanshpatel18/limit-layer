/**
 * Minimal type for the Limit Layer protocol IDL.
 * Full IDL is loaded from idl.json.
 */
export type LimitlayerProtocol = {
  address: string;
  metadata: { name: string; version: string };
  instructions: unknown[];
  accounts: unknown[];
  types: unknown[];
  errors: unknown[];
};
