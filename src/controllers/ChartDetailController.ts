// import { Request, Response } from 'express';
// import { ChartDetailService } from '../services/ChartDetailService';
// import { ChartDetailData } from '../models/ChartDetail';
// import { chartDetailService } from '../utils/ServiceLocator';

// export const createChartDetail = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const chartDetailData: ChartDetailData = req.body;
      
//       // Basic validation - adjust based on your ChartDetailData interface
//       if (!chartDetailData.CPNo) {
//         res.status(400).json({ 
//           status: false,
//           message: 'Customer Product number is required' 
//         });
//         return;
//       }

//       const chartDetail = await chartDetailService.createChartDetail(chartDetailData);
      
//       res.status(201).json({
//         status: true,
//         message: "Chart Detail created successfully",
//         data: chartDetail,
//       });
//     } catch (error) {
//       console.error('Error creating chart detail:', error);
//       res.status(500).json({
//         status: false,
//         message: 'Server error while creating chart detail'
//       });
//     }
//   }

//   // Get chart detail by ID
// export const getChartDetailById = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { id } = req.params;
      
//       if (!id) {
//         res.status(400).json({ 
//           status: false,
//           message: 'Chart Detail ID is required' 
//         });
//         return;
//       }

//       const chartDetail = await chartDetailService.getChartDetailById(id);
      
//       if (!chartDetail) {
//         res.status(404).json({ 
//           status: false,
//           message: `Chart Detail with ID ${id} not found`
//         });
//         return;
//       }

//       res.status(200).json({
//         status: true,
//         message: "Chart Detail retrieved successfully",
//         data: chartDetail
//       });
//     } catch (error) {
//       console.error('Error fetching chart detail:', error);
      
//       // Handle specific validation errors
//       if (error instanceof Error && error.message === 'Invalid chart detail ID') {
//         res.status(400).json({
//           status: false,
//           message: 'Invalid chart detail ID format'
//         });
//         return;
//       }

//       res.status(500).json({
//         status: false,
//         message: 'Server error while fetching chart detail'
//       });
//     }
//   }

// export const getChartDetailsByCPNo = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { cpNo } = req.params;
      
//       if (!cpNo) {
//         res.status(400).json({ 
//           status: false,
//           message: 'Customer Product number is required' 
//         });
//         return;
//       }

//       const chartDetails = await chartDetailService.getChartDetailsByCPNo(cpNo);
      
//       res.status(200).json({
//         status: true,
//         message: "Chart Details retrieved successfully",
//         data: chartDetails,
//         count: chartDetails.length
//       });
//     } catch (error) {
//       console.error('Error fetching chart details by CP number:', error);
//       res.status(500).json({
//         status: false,
//         message: 'Server error while fetching chart details'
//       });
//     }
//   }

//   // Get chart details by FG number
// export const getChartDetailsByFGNo = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { fgNo } = req.params;
      
//       if (!fgNo) {
//         res.status(400).json({ 
//           status: false,
//           message: 'FG number is required' 
//         });
//         return;
//       }

//       const chartDetails = await chartDetailService.getChartDetailsByFGNo(fgNo);
      
//       res.status(200).json({
//         status: true,
//         message: "Chart Details retrieved successfully",
//         data: chartDetails,
//         count: chartDetails.length
//       });
//     } catch (error) {
//       console.error('Error fetching chart details by FG number:', error);
//       res.status(500).json({
//         status: false,
//         message: 'Server error while fetching chart details'
//       });
//     }
//   }