export interface MasterApiResponse {
  lot_number: string;
  furnace_number: number;
  furnace_description: string;
  fg_code: string;
  part_number: string;
  part_name: string;
  collected_date: Date;
  surface_hardness: number;
  hardness_01mm: number;
  cde_x: number;
  cdt_x: number;
  core_hardness: number;
  compound_layer: number;
  surface_upper_spec: number;
  surface_lower_spec: number;
  surface_target: number;
  cde_upper_spec: number;
  cde_lower_spec: number;
  cde_target: number;
  cdt_upper_spec: number;
  cdt_lower_spec: number;
  cdt_target: number;
  is_active: boolean;
}

export interface MasterApiRequest {
  DB: string;
  MATCP: string;
  STARTyear: string;
  STARTmonth: string;
  STARTday: string;
  ENDyear: string;
  ENDmonth: string;
  ENDday: string;
}

/*
{
    "DB":"",
    "MATCP":"24006947",
    "STARTyear":"2025",
    "STARTmonth":"01",
    "STARTday":"01",
    "ENDyear":"2025",
    "ENDmonth":"06",
    "ENDday":"31"
}*/