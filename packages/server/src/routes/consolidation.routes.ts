import { Router } from "express";
import { consolidationController } from "../controllers/consolidation-app/consolidation.controller.js";
import { memberController } from "../controllers/consolidation-app/member.controller.js";
import { networkController } from "../controllers/consolidation-app/network.controller.js";

const router: Router = Router();

// =================================================================
// 👥 MIEMBROS / REGISTROS (Personas a consolidar)
// =================================================================
router.get("/members", memberController.allMembers);
router.get("/members/:id", memberController.oneMember);
router.post("/members/new-member", memberController.createMember);
router.post("/members/new-members", memberController.createBulkMembers);
router.put("/members/:id", memberController.updateMember);
router.delete("/members/:id", memberController.deleteMember);

// =================================================================
// 🌐 REDES
// =================================================================
router.get("/networks", networkController.allNetworks);
router.get("/networks/:id", networkController.oneNetwork);
router.post("/networks/new-network", networkController.createNetwork);
router.put("/networks/:id", networkController.updateNetwork);
router.delete("/networks/:id", networkController.deleteNetwork);

// =================================================================
// 🤝 CONSOLIDACIONES (Gestión de visitas y llamadas)
// =================================================================
router.get("/", consolidationController.allConsolidations);
router.get("/:id", consolidationController.oneConsolidation);
router.post("/new-consolidation", consolidationController.createConsolidation);
router.put("/:id", consolidationController.updateConsolidation);
router.delete("/:id", consolidationController.deleteConsolidation);

export default router;
