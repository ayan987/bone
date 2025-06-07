export class CreateAbruf {
  id: string;
  clientId: string;
  projectId: string;
  abrufs: [
    {
      abrufName: string;
      abrufNo: string;
      startDate: string;
      endDate: string;
      status: string;
    }
  ]
  status: string;

  public constructor(){
    this.id = '';
    this.clientId = '';
    this.projectId = '';
    this.abrufs = [
      {
        abrufName: '',
        abrufNo: '',
        startDate: '',
        endDate: '',
        status: ''
      }
    ];
    this.status = '';
  }
}
