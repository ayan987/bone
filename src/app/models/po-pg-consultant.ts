export interface IPoPgConsultant {
    poNo?: string;
    poId?: string;
    poStartDate?: string;
    poEndDate?: string;
    pgId?: string;
    pgName?: string;
    consultantId: string;
    consultantName: string;
    consulantStartDate: string | null;
    consulantEndDate: string | null;
    flag: boolean;
    assignmentId: string;
  }