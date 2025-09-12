import { ChartDetailController } from "../controllers/chartDetailController";
import { CustomerProductController } from "../controllers/customerProductController";
import { FurnaceController } from "../controllers/furnaceController";
import { MasterDataController } from "../controllers/masterDataController";
import { PeriodFilterController } from "../controllers/periodFilterController";
import { ChartDetailRepository } from "../repositories/chartDetailRepo";
import { CustomerProductRepository } from "../repositories/customerProductRepo";
import { FurnaceRepository } from "../repositories/furnaceRepo";
import { SettingRepository } from "../repositories/SettingRepo";
import { ChartDetailService } from "../services/ChartDetailService";
import { CustomerProductService } from "../services/CustomerProductService";
import { FurnaceService } from "../services/FurnaceService";
import { MasterDataService } from "../services/masterDataService";
import { SettingService } from "../services/SettingService";

export const furnaceRepository = new FurnaceRepository();
export const furnaceService = new FurnaceService(furnaceRepository);
export const furnaceController = new FurnaceController();


export const cpRepository = new CustomerProductRepository();
export const customerProductService = new CustomerProductService(cpRepository);
export const customerProductController = new CustomerProductController();

export const chartDetailRepository = new ChartDetailRepository();
export const chartDetailService = new ChartDetailService(chartDetailRepository);
export const chartDetailController = new ChartDetailController();

export const settingRepository = new SettingRepository();
export const settingService = new SettingService();

export const periodFilterController = new PeriodFilterController();

export const masterDataService = new MasterDataService(furnaceService, customerProductService, chartDetailService);
export const masterDataController = new MasterDataController( masterDataService);
