import Part, { IPart } from "../models/Part";

export async function createExamplePart(data: Partial<IPart>) {
  const part = new Part(data);
  return await part.save();
}

export async function getExamplePart(partNo: string) {
  return await Part.findOne({ partNo });
}