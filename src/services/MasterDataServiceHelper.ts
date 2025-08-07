// MasterDataServiceHelper.ts
export class MasterDataServiceHelper {
 
    createInvertedIndex(itemobject: Record<string, string>) {
    const invertedIndex: Record<string, string> = {};
    
    if (!itemobject || typeof itemobject !== 'object') {
        // console.warn('itemobject is null, undefined, or not an object:', itemobject);
        return {};
    }
    
    for (const [itemCode, name] of Object.entries(itemobject)) {
        invertedIndex[name] = itemCode;
    }
    
    return invertedIndex;
    }

    getBTWValuesOptimized(
    data: any, 
    invertedIndex: Record<string, string>, 
    targetName: string
    ) {
    const itemCode = invertedIndex[targetName];
    if (!itemCode) return null;

    let specification = null;

    // ลองหาใน itemData.SPECIFICATIONve ก่อน
    const itemData = data[itemCode];
    if (itemData?.SPECIFICATIONve?.[itemCode]) {
    specification = itemData.SPECIFICATIONve[itemCode];
    }
    
    // ถ้าไม่เจอ ลองหาใน Surface Hardness SPECIFICATIONve
    if (!specification) {
    const surfaceHardnessCode = invertedIndex["Surface Hardness"];
    const surfaceHardnessData = data[surfaceHardnessCode];
    
    if (surfaceHardnessData?.SPECIFICATIONve?.[itemCode]) {
        specification = surfaceHardnessData.SPECIFICATIONve[itemCode];
    }
    }

    if (!specification) {
    return null;
    }

    return {
    itemCode: itemCode,
    name: targetName,
    BTW_LOW: specification.BTW_LOW,
    BTW_HI: specification.BTW_HI,
    TARGET: specification.TARGET,
    condition: specification.condition
    };
    }

    transformToSpecFormat(btwData: any) {
    if (!btwData) {
        return null;
    }

    return {
        itemCode: btwData.itemCode,
        name: btwData.name,
        upper_spec: btwData.BTW_HI || 0,
        lower_spec: btwData.BTW_LOW || 0,
        target: btwData.TARGET || 0,
        condition: btwData.condition
    };
    }

    getFoundBTWValues(
    data: any,
    invertedIndex: Record<string, string>,
    targetNames: string[]
    ) {
    return targetNames
        .map(targetName => ({
        targetName,
        data: this.getBTWValuesOptimized(data, invertedIndex, targetName)
        }))
        .filter(result => result.data !== null);
    }

  transformMultipleToSpecFormat(
  data: any,
  invertedIndex: Record<string, string>,
  targetNames: string[]
  ) {
  console.log('🔍 transformMultipleToSpecFormat processing...');
  if (Array.isArray(data)) {
    return data.flatMap((record, recordIndex) => {
      console.log(`\n🔍 Processing spec for record ${recordIndex}:`);
      
      return targetNames
        .map(targetName => {
          console.log(`🔍 Getting spec for: ${targetName}`);
          
          // ใช้ getBTWValuesOptimized แทน
          const btwResult = this.getBTWValuesOptimized(record, invertedIndex, targetName);
          
          if (!btwResult) {
            console.log(`⚠️ No BTW result for: ${targetName}`);
            return null;
          }
          
          // ใช้ transformToSpecFormat เพื่อแปลง BTW เป็น spec format
          const specData = this.transformToSpecFormat(btwResult);
          
          if (!specData) {
            console.log(`⚠️ No spec data for: ${targetName}`);
            return null;
          }
          
          console.log(`✅ Found spec for ${targetName}:`, {
            upper_spec: specData.upper_spec,
            lower_spec: specData.lower_spec,
            target: specData.target
          });
          
          return {
            recordIndex,
            itemCode: specData.itemCode,
            name: targetName,
            upper_spec: specData.upper_spec || 0,
            lower_spec: specData.lower_spec || 0,
            target: specData.target || 0
          };
        })
        .filter(result => result !== null);
    });
  } else {
    // Single record processing
    console.log('🔍 Processing single record for spec');
    return targetNames
      .map(targetName => {
        console.log(`🔍 Getting spec for: ${targetName}`);
        
        const btwResult = this.getBTWValuesOptimized(data, invertedIndex, targetName);
        
        if (!btwResult) {
          console.log(`⚠️ No BTW result for: ${targetName}`);
          return null;
        }
        
        const specData = this.transformToSpecFormat(btwResult);
        
        if (!specData) {
          console.log(`⚠️ No spec data for: ${targetName}`);
          return null;
        }
        
        console.log(`✅ Found spec for ${targetName}:`, {
          upper_spec: specData.upper_spec,
          lower_spec: specData.lower_spec,
          target: specData.target
        });
        
        return {
          itemCode: specData.itemCode,
          name: targetName,
          upper_spec: specData.upper_spec || 0,
          lower_spec: specData.lower_spec || 0,
          target: specData.target || 0
        };
      })
      .filter(result => result !== null);
  }
}

  // แก้ไข getAttributeMeanData ให้ handle missing data
  getAttributeMeanData(
    data: any,
    invertedIndex: Record<string, string>,
    targetNames: string[]
  ) {
    console.log('🔍 getAttributeMeanData processing...');
    
    // ถ้า data เป็น array ให้ process แต่ละ record
    if (Array.isArray(data)) {
      return data.flatMap((record, recordIndex) => {
        console.log(`\n🔍 Processing record ${recordIndex}:`);
        
        return targetNames
          .map(targetName => {
            const itemCode = invertedIndex[targetName];
            console.log(`🔍 ${targetName} -> itemCode: ${itemCode}`);
            
            if (!itemCode) {
              console.log(`⚠️ No itemCode found for: ${targetName} (skipping - optional data)`);
              return null; // Return null แทน throw error
            }
            
            // ใช้ record.itemobject แทน data โดยตรง
            const itemData = record[itemCode];
            console.log(`🔍 itemData exists for ${itemCode}:`, !!itemData);
            
            if (!itemData) {
              console.log(`⚠️ No itemData found for itemCode: ${itemCode} (skipping - optional data)`);
              return null; // Return null แทน throw error
            }
            
            console.log(`🔍 data_ans exists for ${itemCode}:`, !!itemData.data_ans);
            
            if (!itemData.data_ans) {
              console.log(`⚠️ No data_ans found for: ${itemCode} (skipping - optional data)`);
              return null; // Return null แทน throw error
            }
            
            console.log(`✅ Found data for ${targetName}:`, itemData.data_ans);
            
            return {
              recordIndex,
              itemCode,
              name: targetName,
              data_ans: itemData.data_ans
            };
          })
          .filter((result): result is { 
            recordIndex: number; 
            itemCode: string; 
            name: string; 
            data_ans: any 
          } => result !== null);
      });
    } 
    
    // ถ้า data เป็น single record
    else {
      console.log('🔍 Processing single record');
      return targetNames
        .map(targetName => {
          const itemCode = invertedIndex[targetName];
          
          if (!itemCode) {
            console.log(`⚠️ No itemCode found for: ${targetName} (skipping)`);
            return null;
          }
          
          const itemData = data.itemobject?.[itemCode];
          
          if (!itemData || !itemData.data_ans) {
            console.log(`⚠️ No data found for: ${itemCode} (skipping)`);
            return null;
          }
          
          return {
            itemCode,
            name: targetName,
            data_ans: itemData.data_ans
          };
        })
        .filter(result => result !== null);
    }
  }

  createLookupMap<T extends { name: string }>(results: (T | null)[]): Record<string, T> {
  return results
      .filter((item): item is T => item !== null) // Type guard
      .reduce((acc, item) => {
      acc[item.name] = item;
      return acc;
      }, {} as Record<string, T>);
  }
}