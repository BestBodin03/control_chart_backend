import { CustomerProductData, CustomerProduct } from "../models/entities/customerProduct";
import { CustomerProductRepository } from "../repositories/customerProductRepo";


// ✅ Customer Product Service
export class CustomerProductService {
  constructor(private cpRepository: CustomerProductRepository) {}

  async bulkCreateUniqueCustomerProducts(cpDataArray: CustomerProductData[]): Promise<CustomerProduct[]> {
    const uniqueCPNos = [...new Set(cpDataArray.map(cp => cp.CPNo))];
    console.log(`Unique CP numbers to process: ${uniqueCPNos.length}`);
    
    // Check existing customer products
    const existingCPNos = await this.cpRepository.findExistingCPNos(uniqueCPNos);
    const existingSet = new Set(existingCPNos);
    
    // Filter new customer products only
    const newCPData = cpDataArray.filter(cp => !existingSet.has(cp.CPNo));
    const uniqueNewCPData = newCPData.filter((cp, index, arr) => 
      arr.findIndex(item => item.CPNo === cp.CPNo) === index
    );

    console.log(`New customer products to insert: ${uniqueNewCPData.length}`);
    
    if (uniqueNewCPData.length > 0) {
      return await this.cpRepository.bulkCreate(uniqueNewCPData);
    }
    
    return [];
  }

  async getAllCustomerProducts(): Promise<CustomerProduct[]> {
    return await this.cpRepository.findAll();
  }
}