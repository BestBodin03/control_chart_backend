export interface FGDataEncoding {
    masterCollectedDate: Date;
    masterFurnaceNo: number;
    masterFGcode: string; // code ที่ได้จาก API
}

export class FurnaceCodeEncoder {

    private static encodeMonth(month: number): string {
        const monthMap: Record<number, string> = {
            1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6',
            7: '7', 8: '8', 9: '9', 10: 'A', 11: 'B', 12: 'C'
        };
        return monthMap[month] || '1';
    }
    
    private static encodeFurnaceNumber(furnaceNo: number): string {
        if (furnaceNo >= 1 && furnaceNo <= 9) {
            return furnaceNo.toString();
        } else if (furnaceNo >= 10 && furnaceNo <= 35) {
            return String.fromCharCode(65 + (furnaceNo - 10)); // A=10, B=11, ..., Z=35
        }
        return '1';
    }
    
    // รับ code จาก IMasterData.masterFG_CHARG.masterFG_CHARGCode
    static encode(masterFurnaceNo: string | number, masterCollectedDate: string | Date, code: string): FGDataEncoding {
        const furnaceNo = typeof masterFurnaceNo === 'string' 
            ? parseInt(masterFurnaceNo, 10) 
            : masterFurnaceNo;
        
        const date = typeof masterCollectedDate === 'string' 
            ? new Date(masterCollectedDate) 
            : masterCollectedDate;
        
        return {
            masterCollectedDate: date,
            masterFurnaceNo: furnaceNo,
            masterFGcode: code // ใช้ code ที่ส่งเข้ามาจาก API
        };
    }
}