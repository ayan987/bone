import { ColumnData } from "./columnData";

export interface TableColumnData {
    name: string;
    startDate: string;
    endDate: string | null;
    assignmentId: string;
    columns: {
      column1: ColumnData;
      column2: ColumnData;
      column3: ColumnData;
      column4: ColumnData;
    };
  }