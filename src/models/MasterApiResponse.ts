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
  cde_y: number;
  core_hardness: number;
  compound_layer: number;
  upper_spec: number;
  lower_spec: number;
  target_spec: number;
  is_active: boolean;
}