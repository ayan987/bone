export class Milestone {
  id: string;          // id is optional now
  pcaId: string;
  projectId: string;
  clientId: string;
  abrufId: string;       // assuming abrufId is required
  milestoneName: string;
  milestoneStartDate: string;
  milestoneEndDate: string;

  constructor(){
    this.id = "",
    this.pcaId = "",
    this.projectId = "",
    this.clientId = "",
    this.abrufId = "",
    this.milestoneName = "",
    this.milestoneStartDate = "",
    this.milestoneEndDate = ""
  }

}
