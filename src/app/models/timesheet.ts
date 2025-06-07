export class Timesheet {
  id: string;
  poId: string;
  abrufId: string;
  pgId: string;
  consultantId: string;
  assignmentId: string;
  month: number;
  year: number;
  onsiteHrs: number;
  remoteHrs: number;
  totalHrs: number;

  constructor() {
    this.id = '';
    this.poId = '';
    this.abrufId = '';
    this.pgId = '';
    this.consultantId = '';
    this.assignmentId = '';
    this.month = 0;
    this.year = 0;
    this.onsiteHrs = 0;
    this.remoteHrs =
    this.totalHrs = 0;
  }
}
