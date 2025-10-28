import { masterDataFGEncoder } from "../models/masterDataFgEncoder";


export class FurnaceCodeEncoder {
  private static encodeMonth(month: number): string {
    const monthMap: Record<number, string> = {
      1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6',
      7: '7', 8: '8', 9: '9', 10: 'A', 11: 'B', 12: 'C'
    };
    return monthMap[month] || '1';
  }

  private static decodeMonth(encodedMonth: string): number {
    const reverseMonthMap: Record<string, number> = {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
      '7': 7, '8': 8, '9': 9, 'A': 10, 'B': 11, 'C': 12
    };
    return reverseMonthMap[encodedMonth] || 1;
  }

  private static encodeFurnaceNumber(furnaceNo: number): string {
    if (furnaceNo >= 1 && furnaceNo <= 9) {
      return furnaceNo.toString();
    } else if (furnaceNo >= 10 && furnaceNo <= 35) {
      let realFurnaceNo = String.fromCharCode(65 + (furnaceNo - 10));
      return realFurnaceNo;
    }
    return '1';
  }

  private static extractDateFromFGCode(fgCode: string): Date {
    try {
      const match = fgCode.match(/^G([0-9A-C]{5})B/);
      
      if (!match) {
        return new Date();
      }
      const dateStr = match[1];
      const yy = parseInt(dateStr.substring(0, 2), 10);
      const encodedMonth = dateStr.substring(2, 3);
      const dd = parseInt(dateStr.substring(3, 5), 10);
      const m = this.decodeMonth(encodedMonth);
      const fullYear = 2000 + yy;
      const now = new Date();
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();
      const seconds = now.getUTCSeconds();
      const milliseconds = now.getUTCMilliseconds();
      const extractedDate = new Date(Date.UTC(fullYear, m - 1, dd, hours, minutes, seconds, milliseconds));
      return extractedDate;
    } catch (error) {
      return new Date();
    }
  }

  private static extractFurnaceFromFGCode(fgCode: string): number {
    try {
      if (fgCode.length < 8) {
        return 1;
      }
      
      const furnaceChar = fgCode.charAt(7); 
      if (/^\d$/.test(furnaceChar)) {
        const furnaceNo = parseInt(furnaceChar, 10);
        return furnaceNo;
      }
      
      if (/^[A-Z]$/.test(furnaceChar)) {
        const furnaceNo = furnaceChar.charCodeAt(0) - 65 + 10;
        return furnaceNo;
      }
      
      return 1; // Default
    } catch (error) {
      console.error('Error extracting furnace from FG_CODE:', error);
      return 1;
    }
  }

  static encode(masterFurnaceNo: string | number, masterCollectedDate: Date, code: string): masterDataFGEncoder {

    const extractedDate = this.extractDateFromFGCode(code);
    const extractedFurnaceNo = this.extractFurnaceFromFGCode(code);

    return {
      masterCollectedDate: extractedDate, 
      masterFurnaceNo: extractedFurnaceNo, 
      masterFGcode: code 
    };
  }
}

function getCurrentDateParts(): { year: string; month: string; day: string } {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  return { year, month, day };
}

export function autoCompleteEndDate(
  endYear?: string,
  endMonth?: string,
  endDay?: string
): { ENDyear: string; ENDmonth: string; ENDday: string } {
  const currentDate = getCurrentDateParts();
  
  return {
    ENDyear: endYear || currentDate.year,
    ENDmonth: endMonth || currentDate.month,
    ENDday: endDay || currentDate.day
  };
}