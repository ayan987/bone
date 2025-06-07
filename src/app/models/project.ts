import { ResponsiblePersonDto } from "./end-client.model";
import { ProjectLocation } from "./projectLocation";

export class Project {
    id: string;
    projectName: string;
    projectDescription: string;
    projectLocation: ProjectLocation | null;
    endClients?: EndClientDto | null;
    responsiblePerson?: ResponsiblePersonDto | null;
    abrufRequired: boolean;
    status: string;

    public constructor(){
      this.id = '';
      this.projectName = '';
      this.projectDescription = '';
      this.projectLocation = {
        cityName: '',
        countryCode: ''
      }
      this.abrufRequired = false;
      this.status = '';
    }
  }

  class EndClientDto {
    id?: string;
    name?: string;
  }
