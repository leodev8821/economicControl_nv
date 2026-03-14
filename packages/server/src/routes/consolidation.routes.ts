import { Router } from "express";
import { consolidationController } from "../controllers/consolidation-app/consolidation.controller.js";
import { memberController } from "../controllers/consolidation-app/member.controller.js";
import { networkController } from "../controllers/consolidation-app/network.controller.js";

const router: Router = Router();

// =================================================================
// 👥 MEMBERS
// =================================================================
router.get("/members", memberController.allMembers);
router.get("/members/:id", memberController.oneMember);

router.post("/members", memberController.createMember);
router.post("/members/bulk", memberController.createBulkMembers);

router.put("/members/:id", memberController.updateMember);
router.delete("/members/:id", memberController.deleteMember);

// =================================================================
// 🌐 NETWORKS
// =================================================================
router.get("/networks", networkController.allNetworks);
router.get("/networks/:id", networkController.oneNetwork);

router.post("/networks", networkController.createNetwork);
router.put("/networks/:id", networkController.updateNetwork);
router.delete("/networks/:id", networkController.deleteNetwork);

// =================================================================
// 🤝 CONSOLIDATIONS
// =================================================================
router.get("/consolidations", consolidationController.allConsolidations);
router.get("/consolidations/:id", consolidationController.oneConsolidation);

router.post("/consolidations", consolidationController.createConsolidation);
router.post(
  "/consolidations/bulk",
  consolidationController.createBulkConsolidations,
);

router.put("/consolidations/:id", consolidationController.updateConsolidation);
router.delete(
  "/consolidations/:id",
  consolidationController.deleteConsolidation,
);

export default router;
