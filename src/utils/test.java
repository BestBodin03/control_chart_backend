import mongoose, { Schema, Document } from 'mongoose';

// Interface สำหรับข้อมูล
interface IData extends Document {
  title: string;
  createdAt: Date;
}

// Interface สำหรับ Period Filter
interface IPeriodFilter {
  startDate: Date;
  endDate: Date;
}

// Schema
const DataSchema = new Schema<IData>({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Data = mongoose.model<IData>('Data', DataSchema);

// ฟังก์ชันหลักสำหรับกรองข้อมูลที่อยู่ในช่วงเวลา (Period)
class PeriodFilter {
  
  // หาข้อมูลที่อยู่ในช่วงเวลาที่กำหนด
  static async findDataInPeriod(startDate: string | Date, endDate: string | Date) {
    // แปลงเป็น Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // ตั้งเวลาเริ่มต้นเป็น 00:00:00
    start.setHours(0, 0, 0, 0);
    
    // ตั้งเวลาสิ้นสุดเป็น 23:59:59
    end.setHours(23, 59, 59, 999);
    
    // Query ข้อมูลที่อยู่ในช่วงเวลา
    const result = await Data.find({
      createdAt: {
        $gte: start,    // มากกว่าหรือเท่ากับวันเริ่มต้น
        $lte: end       // น้อยกว่าหรือเท่ากับวันสิ้นสุด
      }
    }).sort({ createdAt: 1 });
    
    return result;
  }
  
  // หาข้อมูลที่อยู่ในช่วงเวลา + เงื่อนไขเพิ่มเติม
  static async findDataInPeriodWithConditions(
    startDate: string | Date, 
    endDate: string | Date,
    additionalConditions: any = {}
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    // รวมเงื่อนไขช่วงเวลากับเงื่อนไขอื่นๆ
    const query = {
      createdAt: {
        $gte: start,
        $lte: end
      },
      ...additionalConditions
    };
    
    const result = await Data.find(query).sort({ createdAt: 1 });
    return result;
  }
  
  // นับจำนวนข้อมูลที่อยู่ในช่วงเวลา
  static async countDataInPeriod(startDate: string | Date, endDate: string | Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    const count = await Data.countDocuments({
      createdAt: {
        $gte: start,
        $lte: end
      }
    });
    
    return count;
  }
  
  // ตรวจสอบว่าข้อมูลอยู่ในช่วงเวลาหรือไม่
  static isDateInPeriod(
    checkDate: Date, 
    startDate: string | Date, 
    endDate: string | Date
  ): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const check = new Date(checkDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return check >= start && check <= end;
  }
}

// ตัวอย่างการใช้งาน
async function examples() {
  
  // ตัวอย่าง 1: หาข้อมูลในช่วง 1 Jan 2024 - 16 June 2025
  console.log("=== ข้อมูลในช่วง 1 Jan 2024 - 16 June 2025 ===");
  const dataInPeriod = await PeriodFilter.findDataInPeriod(
    '2024-01-01',
    '2025-06-16'
  );
  console.log(`พบข้อมูล ${dataInPeriod.length} รายการ`);
  
  // ตัวอย่าง 2: หาข้อมูลในช่วงเวลา + เงื่อนไขเพิ่มเติม
  console.log("\n=== ข้อมูลในช่วงเวลา + เงื่อนไขเพิ่มเติม ===");
  const filteredData = await PeriodFilter.findDataInPeriodWithConditions(
    '2024-01-01',
    '2025-06-16',
    { title: { $regex: 'งาน', $options: 'i' } }  // ชื่อที่มีคำว่า "งาน"
  );
  console.log(`พบข้อมูลที่กรอง ${filteredData.length} รายการ`);
  
  // ตัวอย่าง 3: นับจำนวนข้อมูลในช่วงเวลา
  console.log("\n=== นับจำนวนข้อมูลในช่วงเวลา ===");
  const count = await PeriodFilter.countDataInPeriod(
    '2024-01-01',
    '2025-06-16'
  );
  console.log(`จำนวนข้อมูลทั้งหมด: ${count} รายการ`);
  
  // ตัวอย่าง 4: ตรวจสอบว่าวันที่อยู่ในช่วงเวลาหรือไม่
  console.log("\n=== ตรวจสอบวันที่ ===");
  const testDate = new Date('2024-06-15');
  const isInPeriod = PeriodFilter.isDateInPeriod(
    testDate,
    '2024-01-01',
    '2025-06-16'
  );
  console.log(`วันที่ ${testDate.toDateString()} อยู่ในช่วงเวลาหรือไม่: ${isInPeriod}`);
}

// ฟังก์ชันช่วยสำหรับสร้างข้อมูลตัวอย่าง
async function createSampleData() {
  const sampleData = [
    {
      title: "งานในช่วงที่กำหนด 1",
      createdAt: new Date('2024-03-15')
    },
    {
      title: "งานในช่วงที่กำหนด 2", 
      createdAt: new Date('2024-08-20')
    },
    {
      title: "งานในช่วงที่กำหนด 3",
      createdAt: new Date('2025-02-10')
    },
    {
      title: "งานนอกช่วงที่กำหนด",
      createdAt: new Date('2023-12-01')  // นอกช่วง
    },
    {
      title: "งานนอกช่วงที่กำหนด 2",
      createdAt: new Date('2025-07-01')  // นอกช่วง
    }
  ];
  
  try {
    await Data.insertMany(sampleData);
    console.log("สร้างข้อมูลตัวอย่างเรียบร้อย");
  } catch (error) {
    console.error("Error creating sample data:", error);
  }
}

// Raw MongoDB Query (ถ้าต้องการใช้ query ตรงๆ)
const rawQuery = {
  // หาข้อมูลในช่วง 1 Jan 2024 - 16 June 2025
  createdAt: {
    $gte: new Date('2024-01-01T00:00:00.000Z'),
    $lte: new Date('2025-06-16T23:59:59.999Z')
  }
};

// Aggregation Pipeline สำหรับข้อมูลที่ซับซ้อนกว่า
const aggregationPipeline = [
  {
    // กรองข้อมูลในช่วงเวลา
    $match: {
      createdAt: {
        $gte: new Date('2024-01-01T00:00:00.000Z'),
        $lte: new Date('2025-06-16T23:59:59.999Z')
      }
    }
  },
  {
    // เพิ่มข้อมูลว่าอยู่ในช่วงเวลาหรือไม่
    $addFields: {
      isInPeriod: true,
      periodInfo: "2024-01-01 to 2025-06-16"
    }
  },
  {
    // เรียงลำดับ
    $sort: { createdAt: 1 }
  }
];

export { 
  PeriodFilter, 
  examples, 
  createSampleData, 
  rawQuery, 
  aggregationPipeline 
};

APP_DEBUG=
MONGO_URL=
MONGO_URL_MASTER=
QC_REPORT_API=
