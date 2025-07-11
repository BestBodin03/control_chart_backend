// import { Request, Response } from 'express';
// import { CPData } from '../models/CustomerProduct';
// import { customerProductService } from '../utils/ServiceLocator';

// export const createCustomerProduct = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const cpData: CPData = req.body;
      
//       const customerProduct = await customerProductService.createCustomerProduct(cpData);
      
//       res.status(201).json({
//         status: true,
//         message: "Customer Product created successfully",
//         data: customerProduct,
//       });
//     } catch (error) {
//       console.error('Error creating customer product:', error);
//       res.status(500).json({
//         status: false,
//         message: 'Server error'
//       });
//     }
// }

// export const getCustomerProductByCPNo = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { cpNo } = req.params;
        
//         const customerProduct = await customerProductService.getCustomerProductByCPNo(cpNo);
        
//         if (!customerProduct) {
//         res.status(404).json({ 
//             status: false,
//             message: `Customer Product with number ${cpNo} not found`
//         });
//         return;
//         }

//         res.status(200).json({
//         status: true,
//         message: "Customer Product retrieved successfully",
//         data: customerProduct
//         });
//     } catch (error) {
//         console.error('Error fetching customer product:', error);
//         res.status(500).json({
//         status: false,
//         message: 'Server error'
//         });
//     }
// }