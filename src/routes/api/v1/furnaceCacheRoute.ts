import { Router } from "express";
import { furnaceCacheController } from "../../../controllers/furnaceCacheController";
// import { furnaceCacheController } from "../../../controllers/furnace/furnaceCacheController";

const router = Router();

// GET /api/v1/furnace-cache/search?furnaceNo=2 | ?cp=abc998
router.get("/furnace-cache/search", async (req, res) => {
  await furnaceCacheController.search(req, res);
});

// POST /api/v1/furnace-cache/refresh
router.post("/furnace-cache/refresh", async (req, res) => {
  await furnaceCacheController.refresh(req, res);
});

export { router as furnaceCacheRoutes };
