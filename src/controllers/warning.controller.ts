import Warning, { IWarning } from "../models/Warning";

export async function createExampleWarning(data: Partial<IWarning>) {
  const warning = new Warning(data);
  return await warning.save();
}

export async function getExampleWarning(name: string) {
  return await Warning.findOne({ name });
}