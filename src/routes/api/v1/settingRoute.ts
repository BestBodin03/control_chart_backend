import { Router } from "express";
import { settingController } from "../../../controllers/setting/settingController";

const router = Router();

router.post("/setting/create", async (req, res) => {
  settingController.addSettingProfile(req, res);
});

router.patch("/setting/update/:id", async (req, res) =>{
  settingController.updateSettingProfile(req, res);
})

router.delete("/setting/delete", async (req, res) =>{
  settingController.deleteSettingProfile(req, res);
})

router.get("/setting/search", async (req, res) =>{
  settingController.deleteSettingProfile(req, res);
})

router.get("/setting/one-profile/:id", async (req, res) =>{
  settingController.findOneSettingProfile(req, res);
})

router.get("/setting/all-profiles", async (require, res) =>{
  settingController.findAllSettingProfiles(require, res);
})
export { router as settingRoutes };
