// MasterDataServiceHelper.ts
export class MasterDataServiceHelper {
 
    createInvertedIndex(itemobject: Record<string, string>) {
    const invertedIndex: Record<string, string> = {};
    
    if (!itemobject || typeof itemobject !== 'object') {
        console.warn('itemobject is null, undefined, or not an object:', itemobject);
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
    return targetNames
        .map(targetName => this.getBTWValuesOptimized(data, invertedIndex, targetName))
        .filter(btwData => btwData !== null)
        .map(btwData => this.transformToSpecFormat(btwData));
    }

getAttributeMeanData(
  data: any,
  invertedIndex: Record<string, string>,
  targetNames: string[]
) {
  console.log('🔍 Available data keys:', Object.keys(data));
  console.log('🔍 Inverted Index:', invertedIndex);
  
  return targetNames
    .map(targetName => {
      const itemCode = invertedIndex[targetName];
      console.log(`🔍 ${targetName} -> itemCode: ${itemCode}`);
      
      if (!itemCode) {
        console.log(`❌ No itemCode found for: ${targetName}`);
        return null;
      }

      const itemData = data[itemCode];
      console.log(`🔍 itemData exists for ${itemCode}:`, !!itemData);
      
      if (!itemData) {
        console.log(`❌ No itemData found for itemCode: ${itemCode}`);
        console.log(`🔍 Available keys in data:`, Object.keys(data));
        return null;
      }
      
      console.log(`🔍 data_ans exists for ${itemCode}:`, !!itemData.data_ans);
      console.log(`🔍 itemData structure:`, Object.keys(itemData));
      
      if (!itemData.data_ans) {
        console.log(`❌ No data_ans found for: ${itemCode}`);
        return null;
      }

      return {
        itemCode,
        name: targetName,
        data_ans: itemData.data_ans
      };
    })
    .filter((result): result is { itemCode: string; name: string; data_ans: any } => 
      result !== null
    );
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