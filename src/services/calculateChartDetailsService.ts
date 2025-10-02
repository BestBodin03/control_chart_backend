import { CapabilityProcess } from "../models/types/capabilityProcess";
import { chartDetailService } from "../utils/serviceLocator";
import { ChartDetailService } from "./chartDetailService";

class CalculateChartDetailsService {
    constructor(private chartService: ChartDetailService) {}

    async calculateCapability(dataList: number[], lowerSpec: number, upperSpec: number): Promise<CapabilityProcess> {
        if (!dataList || dataList.length === 0) {
            throw new Error('Data list cannot be empty');
        }

        // คำนวณค่าเฉลี่ย (Mean)
        const mean = dataList.reduce((sum, val) => sum + val, 0) / dataList.length;

        // คำนวณค่าเบี่ยงเบนมาตรฐาน (Standard Deviation)
        const variance = dataList.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dataList.length;
        const std = Math.sqrt(variance);

        // คำนวณ CPU (Upper Capability Index)
        const cpu = (upperSpec - mean) / (3 * std);

        // คำนวณ CPL (Lower Capability Index)
        const cpl = (mean - lowerSpec) / (3 * std);

        // คำนวณ CP (Process Capability)
        const cp = (upperSpec - lowerSpec) / (6 * std);

        // คำนวณ CPK (Process Capability Index)
        const cpk = Math.min(cpu, cpl);

        return {
            std: parseFloat(std.toFixed(3)) ?? 0,
            cpu: parseFloat(cpu.toFixed(3)) ?? 0,
            cpl: parseFloat(cpl.toFixed(3)) ?? 0,
            cp: parseFloat(cp.toFixed(3)) ?? 0,
            cpk: parseFloat(cpk.toFixed(3)) ?? 0
        };
    }
}

export const calculateChartDetailsService = new CalculateChartDetailsService(chartDetailService);