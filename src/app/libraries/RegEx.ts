export class RegEx {

  public static getRegExForNameV1(): string {
    return "^([a-zA-Z0-9@*-_:#äöüÄÖÜß\\s()]+)$";
  }


  public static getRegExForPositiveNumbers(): string {
    //return "^(?!0+(,0+)?$)(\\d{1,3}(\\,\\d{2})*|\\d+)(,\\d{1,2})?$";
    return "^(?!0+(,0+)?$)(\\d+)(,\\d{1,2})?$";
  }

  public static getRegExForWholeNumbers(): string {
    return "^(\\d+|0)(,\\d{1,2})?$";
    //"^(\\d{1,3}(\\,\\d{2})*|\\d+)(,\\d{1,2})?$";
  }

  public static getRegExForWholeNumbersWithCheck(updateMode: boolean, remoteAndOnsite: boolean): string {
    //console.log("input1",updateMode);
    //console.log("input2",remoteAndOnsite);
    return "^(\\d+|0)(,\\d{1,2})?$";
    //"^(\\d{1,3}(\\,\\d{2})*|\\d+)(,\\d{1,2})?$";
  }

  public static getRegExForDots(): string {
    return "\\.";
  }

  public static getRedgexForTimesheetEntry(): string {
    return "^[0-9]+(,(00|25|5|75|50))?$";
  }
}
