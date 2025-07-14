import { ChartDetailRepository } from "../repositories/ChartDetailRepo";
import { CustomerProductRepository } from "../repositories/CustomerProductRepo";
import { FurnaceRepository } from "../repositories/FurnaceRepo";
import { SettingRepository } from "../repositories/SettingRepo";
import { ChartDetailService } from "../services/ChartDetailService";
import { CustomerProductService } from "../services/CustomerProductService";
import { FurnaceService } from "../services/FurnaceService";
import { MasterDataService } from "../services/MasterDataService";
import { SettingService } from "../services/SettingService";

export const furnaceRepository = new FurnaceRepository();
export const furnaceService = new FurnaceService(furnaceRepository);


export const cpRepository = new CustomerProductRepository();
export const customerProductService = new CustomerProductService(cpRepository);

export const chartDetailRepository = new ChartDetailRepository();
export const chartDetailService = new ChartDetailService(chartDetailRepository);

export const settingRepository = new SettingRepository();
export const settingService = new SettingService();

export const masterDataService = new MasterDataService(furnaceService, customerProductService, chartDetailService);