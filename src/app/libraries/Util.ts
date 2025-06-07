import moment from 'moment';
import { RegEx } from './RegEx';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalMessage } from '../models/modal-messages';

export class Util {
  public static extractFormId(str: any): string {
    const parts = str.split('/');
    return parts[parts?.length - 1];
  }

  public static nullToEmptyString(sourceData: any): any {
    Object.keys(sourceData).forEach((key: any) => {
      const value = sourceData[key];
      sourceData[key] = value !== null ? value : '';
    });
    return sourceData;
  }

  public static dateString(dateoriginal: any) {
    if (!dateoriginal) {
      return null;
    }
    const momentDate = moment(dateoriginal);
    if (!momentDate.isValid()) {
      return null;
    }
    return momentDate.format('DD.MM.YYYY');
  }

  public static isNumeric(value: any): boolean {
    return !isNaN(value) && isFinite(value);
  }

  public static convertStrToNumber(value: any): number {
    if (!value) return 0;
    let normalizedValue = String(value).replace(/,/, '.');
    return Util.isNumeric(normalizedValue) ? parseFloat(normalizedValue) : 0;
  }

  public static strIsNullOrEmpty(value: string): boolean {
    if (value) {
      if (typeof value === 'string') {
        return value.trim().length === 0;
      }
    }
    return true;
  }

  public static ensureTwoDecimalPlaces(value: string): string {
    if (!value.includes(',')) {
      return value + ',00';
    } else {
      let parts = value.split(',');
      if (parts[1].length === 1) {
        return parts[0] + ',' + parts[1] + '0';
      } else if (parts[1].length === 0) {
        return parts[0] + ',00';
      }
      return value;
    }
  }

  public static convertNumberToLocalFormat(input: number): string {
    if (input) {
      if (Util.isNumeric(input)) {
        let fixedInput = Util.fixDecimal(input);
        let localizedNumericStr = Util.convertStrToNumber(fixedInput)
          .toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true
          });
        return localizedNumericStr;
      }
    }
    return '0,00';
  }

  public static convertNumberToLocalFormatNoGrouping(input: number): string {
    if (input) {
      if (Util.isNumeric(input)) {
        let fixedInput = Util.fixDecimal(input);
        let localizedNumericStr = Util.convertStrToNumber(fixedInput)
          .toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: false
          });
        return localizedNumericStr;
      }
    }
    return '0,00';
  }

  public static convertNumberToLocalFormatInTimesheet(input: number): string {
    if (input) {
      if (Util.isNumeric(input)) {
        let fixedInput = Util.fixDecimal(input);
        let localizedNumericStr = Util.convertStrToNumber(fixedInput)
          .toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: false
          });
        if (localizedNumericStr) {
          localizedNumericStr = localizedNumericStr.replace(/\./g, '');
          return localizedNumericStr;
        }
      }
    }
    return '0,00';
  }

  public static fixDecimal(input: number): string {
    return input % 1 === 0 ? input.toString() : input.toFixed(2);
  }

  public static convertZeroValueForTotals(
    value: string | null | undefined
  ): string | null | undefined {
    if (value !== null && value !== undefined && value === '0') {
      return '0,00';
    }
    return value;
  }

  public static isHttp409Error(error: any): boolean {
    console.error('Error:', error);
    return error instanceof HttpErrorResponse && error.status === 409;
  }

  public static convertToString(value: number): string {
    const result = value.toString().replace('.', ',');
    return result;
  }

  public static convertToMomentDateFormat(date: string): any{
    if (date) {
      if(date.trim().length < 1)
      {
        return "";
      }
      else{
        return moment(date, 'DD.MM.yyyy');
      }
    }
    return null;
  }

  public static showModalMessages(heading: string, data: string, message: string): ModalMessage {
    let deleteModalData: ModalMessage = {
      heading: heading,
      data: data,
      message: message
    }
    return deleteModalData
  }

  public static dateMonthYearString(month: string | number | undefined, year: string | number | undefined): string {
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    const date = moment({ year: yearNumber, month: monthNumber - 1 });
    return date.format('MMM-YY');
  }

  public dateMonthYear(fullDateString: string | undefined): string {
    const date = moment(fullDateString, "DD.MM.YYYY");
    return date.format("MMM-YY");
  }

  public timestampFormating(timestamp: string | undefined): string {
    const date = moment(timestamp);

    return date.format("DD.MM.YYYY HH:mm");
  }

  public static getFileId(url: string | URL): string {
    const urlObj = new URL(url);
    const sourcedoc = urlObj.searchParams.get('sourcedoc');
    if (sourcedoc) {
      // Decode the encoded string and remove the curly braces.
      return decodeURIComponent(sourcedoc).replace(/[{}]/g, '');
    }
    return '';
  }

  public static getFileName(url: string | URL): string {
    const urlObj = new URL(url);
    const fileName = urlObj.searchParams.get('file') ?? '';
    const fileNameWithoutBucketId = fileName.substring(0,fileName.lastIndexOf("_")) + fileName.substring(fileName.indexOf("."), fileName.length);
    return fileNameWithoutBucketId;
  }

  public static extractUUID(input: string): string {
      const match = RegExp(/\{([0-9A-Fa-f-]+)\}/).exec(input);
      return match ? match[1] : "";
  }

 /**
 * Extracts the month number and year from a date string
 * @param {string} dateString - Date string in format like "Juni 2025"
 * @returns {Object} Object containing month (1-12) and year
 */
  public static extractMonthAndYear(dateString: string) {
    let month: number | undefined;
    let year: number | undefined;
    const germanMonths: Record<string, number> = {
    'januar': 1,
    'februar': 2,
    'märz': 3,
    'maerz': 3,
    'april': 4,
    'juni': 6,
    'juli': 7,
    'august': 8,
    'september': 9,
    'oktober': 10,
    'november': 11,
    'dezember': 12,

    'jan': 1,
    'feb': 2,
    'mär': 3,
    'mar': 3,
    'apr': 4,
    'mai': 5,
    'jun': 6,
    'jul': 7,
    'aug': 8,
    'sep': 9,
    'okt': 10,
    'nov': 11,
    'dez': 12
  };

  let isDDMMYYYYFormat = moment(dateString, 'DD.MM.YYYY', true).isValid();
  if(!isDDMMYYYYFormat){
    // Split the input string into parts (assuming format is "Month Year")
    const parts = dateString.trim().split(/\s+/);

    // Extract month and year
    const monthStr = parts[0].toLowerCase();
    const yearStr = parts[1];

    // Get month number from mapping
    month = germanMonths[monthStr];
    year = parseInt(yearStr, 10);
  } else {
    // If the format is DD.MM.YYYY, extract month and year directly
    const dateParts = dateString.split('.');
    if (dateParts.length === 3) {
      month = parseInt(dateParts[1], 10);
      year = parseInt(dateParts[2], 10);
    }
  }
    return {month, year};
  }
}
