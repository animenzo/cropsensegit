const router = require("express").Router();
const auth = require("../middleware/auth");
const { 
    createFarm, 
    getMyFarms, 
    getFarmById, 
    updateFarm, 
    deleteFarm 
} = require('../controllers/farmController');

router.post("/farm", auth, createFarm);
router.get("/farm", auth, getMyFarms);
router.get("/farm/:id", auth, getFarmById);
router.patch("/farm/:id", auth, updateFarm);
router.delete("/farm/:id", auth, deleteFarm);

module.exports = router;