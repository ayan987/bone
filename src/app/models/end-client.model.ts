export interface ResponsiblePersonDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  
  export interface EndClientDto {
    endClientName: string;
    responsiblePersons: ResponsiblePersonDto[];
  }
  