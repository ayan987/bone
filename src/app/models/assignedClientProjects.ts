export class AssignedclientProject {
  id: string;
  projectId: string;
  projectName: string;
  abrufRequired: boolean;
  clientId: string;
  shortName: string;

  public constructor(){
    this.id = '';
    this.projectId = '';
    this.projectName = '';
    this.abrufRequired = false;
    this.clientId = '';
    this.shortName = '';
  }
}
