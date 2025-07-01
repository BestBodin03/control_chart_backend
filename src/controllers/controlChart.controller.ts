import ControlChart, { IControlChart } from "../models/ControlChart";

export async function createExampleControlChart(data: Partial<IControlChart>) {
  const chart = new ControlChart(data);
  return await chart.save();
}

export async function getExampleControlChart(partId: string) {
  return await ControlChart.find({ partId });
}