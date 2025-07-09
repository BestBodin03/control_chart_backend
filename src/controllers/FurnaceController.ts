import { Request, Response } from 'express';
import { furnaceService, masterDataService } from '../utils/ServiceLocator';
import { IMasterData } from '../utils/masterDataMapper';
import { FGDataEncoding } from '../utils/masterDataFGEncoding';

export const createFurnace = async (req: Request, res: Response): Promise<void> => {
 try {
   // ✅ Debug incoming request
   console.log('=== DEBUG REQUEST ===');
   console.log('Request body:', JSON.stringify(req.body, null, 2));
   console.log('Request headers:', req.headers);
   console.log('Request method:', req.method);
   console.log('Request URL:', req.url);
   
   const { masterData, fgEncoded }: { masterData: IMasterData; fgEncoded: FGDataEncoding } = req.body;
   
   // ✅ Debug parsed data
   console.log('=== DEBUG PARSED DATA ===');
   console.log('masterData:', masterData);
   console.log('fgEncoded:', fgEncoded);
   console.log('masterData type:', typeof masterData);
   console.log('fgEncoded type:', typeof fgEncoded);
   
   if (!masterData) {
     console.log('❌ Master data is missing');
     res.status(400).json({ 
       status: false,
       message: 'Master data is required' 
     });
     return;
   }

   if (!fgEncoded) {
     console.log('❌ FG encoded data is missing');
     res.status(400).json({ 
       status: false,
       message: 'FG encoded data is required' 
     });
     return;
   }

   // ✅ Debug before service call
   console.log('=== DEBUG BEFORE SERVICE CALL ===');
   console.log('Calling furnaceService.createFurnace with:', {
     masterData: masterData,
     fgEncoded: fgEncoded
   });

   const result = await furnaceService.createFurnace(masterData, fgEncoded);
   
   // ✅ Debug service result
   console.log('=== DEBUG SERVICE RESULT ===');
   console.log('Service result:', result);
   
   res.status(201).json({
     status: true,
     message: "Furnace Successfully Created",
     data: result,
   });
 } catch (error) {
   console.error('=== DEBUG ERROR ===');
   console.error('Error creating furnace:', error);
   console.error('Error stack:', error);
   console.error('Error message:', error);
   
   res.status(500).json({
     status: false,
     message: 'server error'
   });
 }
}


export const getAllFurnaces = async (req: Request, res: Response): Promise<void> => {
    try {
      const furnaces = await furnaceService.getAllFurnaces();
      
      res.status(200).json({
        status: true,
        message: "Furnaces retrieved successfully",
        data: furnaces,
        count: furnaces.length
      });
    } catch (error) {
      console.error('Error fetching furnaces:', error);
      res.status(500).json({
        status: false,
        message: 'Server error while fetching furnaces'
      });
    }
  }

  // Get furnace by furnace number
export const getFurnaceByFurnaceNo = async (req: Request, res: Response): Promise<void> => {
    try {
      const furnaceNo = +req.params.furnaceNo;
      
      if (isNaN(furnaceNo)) {
        res.status(400).json({ 
          status: false,
          message: 'Invalid furnace number format' 
        });
        return;
      }

      const furnace = await furnaceService.getFurnaceByFurnaceNo(furnaceNo);
      
      if (!furnace) {
        res.status(404).json({ 
          status: false,
          message: `Furnace with number ${furnaceNo} not found`
        });
        return;
      }

      res.status(200).json({
        status: true,
        message: "Furnace retrieved successfully",
        data: furnace
      });
    } catch (error) {
      console.error('Error fetching furnace:', error);
      res.status(500).json({
        status: false,
        message: 'Server error while fetching furnace'
      });
    }
  }

//   // Update furnace
//   async updateFurnace(req: Request, res: Response): Promise<void> {
//     try {
//       const furnaceNo = +req.params.furnaceNo;
//       const updateData: Partial<FurnaceData> = req.body;
      
//       if (isNaN(furnaceNo)) {
//         res.status(400).json({ 
//           status: false,
//           message: 'Invalid furnace number format' 
//         });
//         return;
//       }

//       // Check if furnace exists
//       const existingFurnace = await this.furnaceService.getFurnaceByFurnaceNo(furnaceNo);
//       if (!existingFurnace) {
//         res.status(404).json({ 
//           status: false,
//           message: `Furnace with number ${furnaceNo} not found`
//         });
//         return;
//       }

//       // You'll need to add this method to your service
//       // const updatedFurnace = await this.furnaceService.updateFurnace(furnaceNo, updateData);
      
//       res.status(200).json({
//         status: true,
//         message: "Furnace updated successfully",
//         // data: updatedFurnace
//       });
//     } catch (error) {
//       console.error('Error updating furnace:', error);
//       res.status(500).json({
//         status: false,
//         message: 'Server error while updating furnace'
//       });
//     }
//   }

//   // Delete furnace
//   async deleteFurnace(req: Request, res: Response): Promise<void> {
//     try {
//       const furnaceNo = +req.params.furnaceNo;
      
//       if (isNaN(furnaceNo)) {
//         res.status(400).json({ 
//           status: false,
//           message: 'Invalid furnace number format' 
//         });
//         return;
//       }

//       // Check if furnace exists
//       const existingFurnace = await this.furnaceService.getFurnaceByFurnaceNo(furnaceNo);
//       if (!existingFurnace) {
//         res.status(404).json({ 
//           status: false,
//           message: `Furnace with number ${furnaceNo} not found`
//         });
//         return;
//       }

//       // You'll need to add this method to your service
//       // await this.furnaceService.deleteFurnace(furnaceNo);
      
//       res.status(200).json({
//         status: true,
//         message: "Furnace deleted successfully"
//       });
//     } catch (error) {
//       console.error('Error deleting furnace:', error);
//       res.status(500).json({
//         status: false,
//         message: 'Server error while deleting furnace'
//       });
//     }
//   }
// }

// Example route setup
/*
import express from 'express';
import { FurnaceController } from './furnaceController';
import { FurnaceService } from './furnaceService';
import { FurnaceRepository } from './furnaceRepository';

const router = express.Router();

// Initialize dependencies
const furnaceRepository = new FurnaceRepository();
const furnaceService = new FurnaceService(furnaceRepository);
const furnaceController = new FurnaceController(furnaceService);

// Routes
router.post('/furnaces', (req, res) => furnaceController.createFurnace(req, res));
router.get('/furnaces', (req, res) => furnaceController.getAllFurnaces(req, res));
router.get('/furnaces/:furnaceNo', (req, res) => furnaceController.getFurnaceByFurnaceNo(req, res));
router.put('/furnaces/:furnaceNo', (req, res) => furnaceController.updateFurnace(req, res));
router.delete('/furnaces/:furnaceNo', (req, res) => furnaceController.deleteFurnace(req, res));

export default router;*/