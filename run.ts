import { nelsonRule2, nelsonRule2Mask } from "./nelson_2";


// // ตัวอย่างข้อมูล
// const valuesA = [1,2,3,4,5,6,7,8,9,10,11];        // มีแนวโน้มขึ้น (ทดสอบ R3)
// const meanA = valuesA.reduce((s,v)=>s+v,0)/valuesA.length;

const valuesB = [];
  // ส่วนใหญ่ > mean (ทดสอบ R2)
const meanB = 0;


// ---- Rule 2: 9 จุดติดอยู่ฝั่งเดียวของ mean
const r2 = nelsonRule2(valuesB, meanB);
const r2Mask = nelsonRule2Mask(valuesB, meanB);
console.log('R2 segments:', r2.segments);
console.log('R2 violated at indexes:', r2.violatingIndices);
console.log('R2 mask:', r2Mask);

// ใช้ eps ถ้าต้องการมองค่าที่ใกล้ mean ว่า "เท่ากับ" mean (ตัดรัน)
const r2WithEps = nelsonRule2(valuesB, meanB, 1e-6);
console.log('R2(with eps) segments:', r2WithEps.segments);
