import ChartDetail from "../models/ChartDetail";
import CustomerProduct from "../models/CustomerProduct";
import Furnace from "../models/Furnace";
import { ChartDetailRepository } from "../repositories/ChartDetailRepo";
import { CustomerProductRepository } from "../repositories/CustomerProductRepo";
import { FurnaceRepository } from "../repositories/FurnaceRepo";
import { ChartDetailService } from "../services/ChartDetailService";
import { CustomerProductService } from "../services/CustomerProductService";
import { FurnaceService } from "../services/FurnaceService";
import { MasterDataService } from "../services/MasterDataService";


const furnaceRepository = new FurnaceRepository(Furnace);
const chartDetailRepository = new ChartDetailRepository(ChartDetail);
const customerProductRepository = new CustomerProductRepository(CustomerProduct);

const furnaceService = new FurnaceService(furnaceRepository);
const chartDetailService = new ChartDetailService(chartDetailRepository);
const customerProductService = new CustomerProductService(customerProductRepository);
const masterDataService = new MasterDataService(
  furnaceService,
  chartDetailService,
  customerProductService
);

export {
  furnaceService,
  chartDetailService,
  customerProductService,
  masterDataService
};
