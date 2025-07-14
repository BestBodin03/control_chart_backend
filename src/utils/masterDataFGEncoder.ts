import { ImasterDataFGEncoder } from "./ImasterDataFGEncoder";

export class FurnaceCodeEncoder {
  
  private static encodeMonth(month: number): string {
    const monthMap: Record<number, string> = {
      1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6',
      7: '7', 8: '8', 9: '9', 10: 'A', 11: 'B', 12: 'C'
    };
    return monthMap[month] || '1';
  }
  
  // Decode month from encoded format (reverse of encodeMonth)
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
      return realFurnaceNo; // A=10, B=11, ..., Z=35
    }
    return '1';
  }

  // Extract date from FG_CODE format: G<YY><M><DD>B<FurnaceNo>XX
  private static extractDateFromFGCode(fgCode: string): Date {
    try {
      // console.log('Extracting date from FG_CODE:', fgCode);
      
      // Pattern: G<YY><M><DD>B<FurnaceNo>XX
      const match = fgCode.match(/^G([0-9A-C]{5})B/);
      
      if (!match) {
        // console.warn('Invalid FG_CODE format:', fgCode);
        return new Date();
      }
      
      const dateStr = match[1]; // Extract YYMDD (5 characters)
      
      const yy = parseInt(dateStr.substring(0, 2), 10); // First 2 digits (year)
      const encodedMonth = dateStr.substring(2, 3);     // 3rd character (encoded month)
      const dd = parseInt(dateStr.substring(3, 5), 10); // Last 2 digits (day)
      
      // Decode the month using the reverse mapping
      const m = this.decodeMonth(encodedMonth);
      
      // Handle 2-digit year (assume 20xx)
      const fullYear = 2000 + yy;
      
      // Get current time components
      const now = new Date();
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();
      const seconds = now.getUTCSeconds();
      const milliseconds = now.getUTCMilliseconds();
      
      // Create date using UTC with current time
      const extractedDate = new Date(Date.UTC(fullYear, m - 1, dd, hours, minutes, seconds, milliseconds));
      
      // console.log('Date extraction result:', { 
      //   fgCode, 
      //   yy, 
      //   encodedMonth, 
      //   decodedMonth: m, 
      //   dd, 
      //   fullYear,
      //   result: extractedDate.toISOString() 
      // });
      
      return extractedDate;
      
    } catch (error) {
      // console.error('Error extracting date from FG_CODE:', error, fgCode);
      return new Date();
    }
  }

  // Extract furnace number from FG_CODE (ตำแหน่งที่ 8)
  private static extractFurnaceFromFGCode(fgCode: string): number {
    try {
      // console.log('Extracting furnace from FG_CODE:', fgCode);
      
      // Pattern: G<YYMDD>B<FurnaceNo>XX - ตำแหน่งที่ 8 คือ FurnaceNo
      // ตัวอย่าง: G25521B1XX -> position 8 = '1'
      if (fgCode.length < 8) {
        // console.warn('FG_CODE too short:', fgCode);
        return 1;
      }
      
      const furnaceChar = fgCode.charAt(7); // Position 8 (0-indexed = 7)
      // console.log('Furnace character at position 8:', furnaceChar);
      
      // If it's a number (1-9)
      if (/^\d$/.test(furnaceChar)) {
        const furnaceNo = parseInt(furnaceChar, 10);
        // console.log('Decoded furnace number:', furnaceNo);
        return furnaceNo;
      }
      
      // If it's a letter (A=10, B=11, etc.)
      if (/^[A-Z]$/.test(furnaceChar)) {
        const furnaceNo = furnaceChar.charCodeAt(0) - 65 + 10;
        // console.log('Decoded furnace number from letter:', furnaceNo);
        return furnaceNo;
      }
      
      // console.warn('Invalid furnace character:', furnaceChar);
      return 1; // Default
    } catch (error) {
      console.error('Error extracting furnace from FG_CODE:', error);
      return 1;
    }
  }

  // Original encode method - extracts both date and furnace from FG_CODE
  static encode(masterFurnaceNo: string | number, masterCollectedDate: Date, code: string): ImasterDataFGEncoder {
    
    // Extract date and furnace number from FG_CODE
    const extractedDate = this.extractDateFromFGCode(code);
    const extractedFurnaceNo = this.extractFurnaceFromFGCode(code);
    
    // console.log('FG_CODE Processing Results:', {
    //   originalCode: code,
    //   extractedDate: extractedDate.toISOString(),
    //   extractedFurnaceNo,
    //   inputFurnaceNo: masterFurnaceNo
    // });

    return {
      masterCollectedDate: extractedDate, // Use date extracted from FG_CODE
      masterFurnaceNo: extractedFurnaceNo, // Use furnace number extracted from FG_CODE
      masterFGcode: code // The original FG_CODE
    };
  }
}