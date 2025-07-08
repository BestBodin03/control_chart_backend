import { Request, Response } from 'express';
import { fetchMasterData } from '../services/masterDataService';

export const getMasterData = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const data = await fetchMasterData(url);
    res.json(data);
  } catch (error) {
    res.status(500).json({error});
  }
};