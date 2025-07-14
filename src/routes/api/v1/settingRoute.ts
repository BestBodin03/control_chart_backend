import { Router } from "express";
import { settingService } from "../../../utils/serviceLocator";

const router = Router();

// ✅ Create Setting Profile
router.post('/settings', async (req, res) => {
  try {
    const service = settingService;
    const result = await service.createSettingProfile(req.body);
    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      error: error.message || 'Failed to create setting profile' 
    });
  }
});

// ✅ Get All Setting Profiles  
router.get('/settings', async (req, res) => {
  try {
    const service = settingService;
    const result = await service.getAllSettingProfiles();
    res.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to retrieve setting profiles' 
    });
  }
});

export { router as settingRoutes };