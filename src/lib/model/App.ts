import { ClientSideConfiguration } from './ClientSideConfiguration';

export interface App {
  _id: string;
  organizationId: string;
  name: string;
  description?: String;
  clientSideConfiguration: ClientSideConfiguration;
  tokenString: string;
}
