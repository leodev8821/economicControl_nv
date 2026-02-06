import { Router } from "express";
import { consolidationController } from "../controllers/consolidation-app/consolidation.controller.js";
import { memberRegisterController } from "../controllers/consolidation-app/member-register.controller.js";
import { networkController } from "../controllers/consolidation-app/network.controller.js";

const router: Router = Router();

// =================================================================
// 🤝 CONSOLIDACIONES (Gestión de visitas y llamadas)
// =================================================================
router.get("/", consolidationController.allConsolidations);
router.get("/:id", consolidationController.oneConsolidation);
router.post("/new-consolidation", consolidationController.createConsolidation);
router.put("/:id", consolidationController.updateConsolidation);
router.delete("/:id", consolidationController.deleteConsolidation);

// =================================================================
// 👥 MIEMBROS / REGISTROS (Personas a consolidar)
// =================================================================
router.get("/members", memberRegisterController.allMemberRegisters);
router.get("/members/:id", memberRegisterController.oneMemberRegister);
router.post(
  "/members/new-member",
  memberRegisterController.createMemberRegister,
);
router.put("/members/:id", memberRegisterController.updateMemberRegister);
router.delete("/members/:id", memberRegisterController.deleteMemberRegister);

// =================================================================
// 🌐 REDES
// =================================================================
router.get("/networks", networkController.allNetworks);
router.get("/networks/:id", networkController.oneNetwork);
router.post("/networks/new-network", networkController.createNetwork);
router.put("/networks/:id", networkController.updateNetwork);
router.delete("/networks/:id", networkController.deleteNetwork);

export default router;
