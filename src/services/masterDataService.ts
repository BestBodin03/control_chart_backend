export const fetchMasterData = async (url: string) => {
  try {
    const response = await fetch('http://localhost:3001/raw_data');
      if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch master data: ${error}`);
  }
};