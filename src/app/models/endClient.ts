import { ResponsiblePersonDto } from "./end-client.model";

export class EndClient {
  id: string;
  endClientName: string;
  responsiblePersons: ResponsiblePersonDto[];

  constructor() {
    this.id = '';
    this.endClientName = '';
    this.responsiblePersons = [];
  }
}