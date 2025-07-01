import Furnace from "../models/Furnace";

const getExampleFurnace = async () => {
  try {
    const furnaces = await Furnace.find(); // 🔄 ดึงข้อมูลทั้งหมดจาก collection "furnaces"
    console.log('🔥 Found Furnaces:', furnaces);
    return furnaces;
  } catch (error) {
    console.error('❌ Error fetching furnaces:', error);
  }
};

export default getExampleFurnace;
