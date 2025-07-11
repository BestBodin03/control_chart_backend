import { ChartDetailRepository } from "../repositories/ChartDetailRepo";
import { CustomerProductRepository } from "../repositories/CustomerProductRepo";
import { FurnaceRepository } from "../repositories/FurnaceRepo";
import { ChartDetailService } from "../services/ChartDetailService";
import { CustomerProductService } from "../services/CustomerProductService";
import { FurnaceService } from "../services/FurnaceService";
import { MasterDataService } from "../services/MasterDataService";


const furnaceRepository = new FurnaceRepository();
const chartDetailRepository = new ChartDetailRepository();
const customerProductRepository = new CustomerProductRepository();

const furnaceService = new FurnaceService(furnaceRepository);
const chartDetailService = new ChartDetailService(chartDetailRepository);
const customerProductService = new CustomerProductService(customerProductRepository);
const masterDataService = new MasterDataService(
  furnaceService,
  customerProductService,
  chartDetailService,
);

export {
  furnaceService,
  chartDetailService,
  customerProductService,
  masterDataService
};
