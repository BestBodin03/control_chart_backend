import { Request, Response } from 'express';
import { IMasterData } from '../utils/masterDataMapper';
import { FGDataEncoding } from '../utils/masterDataFGEncoding';
import { masterDataService } from '../utils/ServiceLocator';
import { fetchMasterData } from '../services/MasterDataService';

export const getMasterData = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const data = await fetchMasterData('http://localhost:3001/raw_data');
    res.json(data);
  } catch (error) {
    res.status(500).json({error});
  }
};

export const addAllCollections = async (req: Request, res: Response): Promise<void> => {
    try {
      const { masterData, fgEncoded }: { masterData: IMasterData; fgEncoded: FGDataEncoding } = req.body;
      
      // Basic validation
      if (!masterData) {
        res.status(400).json({ 
          status: false,
          message: 'Master data is required' 
        });
        return;
      }

      if (!fgEncoded) {
        res.status(400).json({ 
          status: false,
          message: 'FG encoded data is required' 
        });
        return;
      }

      const result = await masterDataService.addAllCollections(masterData, fgEncoded);
      
      res.status(201).json({
        status: true,
        message: "All collections created successfully",
        data: result,
      });
    } catch (error) {
      console.error('Error creating all collections:', error);
      res.status(500).json({
        status: false,
        message: 'Server error while creating collections'
      });
    }
};