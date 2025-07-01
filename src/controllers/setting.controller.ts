import Setting, { ISetting } from "../models/Setting";

export async function createExampleSetting(data: Partial<ISetting>) {
  const setting = new Setting(data);
  return await setting.save();
}

export async function getExampleSetting(userId: string) {
  return await Setting.findOne({ userId });
}