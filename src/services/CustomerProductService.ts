import { Types } from "mongoose";
import { CPData, ICP } from "../models/CustomerProduct";
import { CustomerProductRepository } from "../repositories/CustomerProductRepo";

export class CustomerProductService {
  constructor(private cpRepository: CustomerProductRepository) {}

  async createCustomerProduct(cpData: CPData): Promise<ICP> {
    return await this.cpRepository.create(cpData);
  }

  async getCustomerProductByCPNo(cpNo: string): Promise<ICP | null> {
    return await this.cpRepository.findByCPNo(cpNo);
  }

}