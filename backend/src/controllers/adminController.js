const { response } = require("express");
const adminService = require("../services/adminService");
const { parse } = require("dotenv");

//Quan ly nguoi dung
let getAllUser = async(req,res) => {
    try{
        let data = await adminService.getAllUserService();
        return res.status(200).json(data)
    }catch(error){
        return res.status(400).json(error)
    }
}

let createUser = async (req, res) => {
    try {
        let { email, password, username,role, image } = req.body;
        let newUser = await adminService.createUserService({ email, password, username, role, image });
        return res.status(201).json(newUser);
    } catch (error) {
        return res.status(400).json(error);
    }
};

let updateUser = async (req, res) => {
    try {
        let userId = req.params.id;
        let userData = req.body;
        let updatedUser = await adminService.updateUserService(userId, userData);
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(400).json(error);
    }
};

let deleteUser = async (req, res) => {
    try {
        let userId = req.params.id;
        await adminService.deleteUserService(userId);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(400).json(error);
    }
};

//cafe-variety
let createCafe = async (req, res) => {
    try {
        let cafeTypeIds = [];
        if (typeof req.body.cafeTypes === "string") {
            try {
                cafeTypeIds = JSON.parse(req.body.cafeTypes);
                if (!Array.isArray(cafeTypeIds)) {
                    cafeTypeIds = [];
                }
            } catch (err) {
                console.error("Lỗi parse cafeTypes:", err);
                cafeTypeIds = [];
            }
        } else if (Array.isArray(req.body.cafeTypes)) {
            cafeTypeIds = req.body.cafeTypes;
        }
        const cafeData = {
            ...req.body,
            cafeTypeIds,
        };

        let newCafe = await adminService.createCafeService(cafeData, req.files);
        return res.status(200).json({
            data: newCafe,
        });
    } catch (error) {
        console.error("Error in createCafe:", error);
        return res.status(400).json({
            error: error.message || error,
        });
    }
};

let getAllCafe = async(req, res) => {
    try{
        let cafeList = await adminService.getAllCafeService();
        return res.status(200).json({cafeList})
    }catch(error){
        return res.status(400).json(error);
    }
}

let getCafeById = async(req,res) => {
    try{
        let cafeId = req.params.id;
        let cafe = await adminService.getCafeByIdService(cafeId);
        if(!cafe){
            return res.status(404).json({message: "No cafe variety found"})
        } 
        return res.status(200).json({cafe})
    }catch(error){
        return res.status(400).json(error)
    }
}

let updateCafe = async(req,res) => {
    try{
        let cafeId = req.params.id;
        const updateData = req.body;
        try {
            if (typeof updateData.cafeTypes === 'string') {
              updateData.cafeTypes = JSON.parse(updateData.cafeTypes);
            }
          } catch (e) {
            return res.status(400).json({ message: 'Invalid cafeTypes format' });
          }
        let updatedCafe = await adminService.updateCafeService(cafeId, updateData, req.files);
        if(!updatedCafe){
            return res.status(404).json({message: "No cafe variety found"})
        }
        return res.status(200).json({updatedCafe})
    }catch(error){
        return res.status(400).json(error)
    }
}

let deleteCafe = async(req,res) => {
    try{
        let cafeId = req.params.id;
        let deletedCafe = await adminService.deleteCafeService(cafeId);
        if(!deletedCafe){
            return res.status(404).json({message: "No cafe variety found"})
        }
        return res.status(200).json({message: "Cafe variety deleted"})
    }catch(error){
        return res.status(400).json(error)
    }
}

//pest-disease
let createPestDisease = async (req, res) => {
    try {
        let growthStageIds = [];
        if (typeof req.body.growthStageIds === "string") {
            try {
                growthStageIds = JSON.parse(req.body.growthStageIds);
                if (!Array.isArray(growthStageIds)) {
                    growthStageIds = [];
                }
            } catch (err) {
                console.error("Lỗi parse growthStageIds:", err);
                growthStageIds = [];
            }
        } else if (Array.isArray(req.body.growthStageIds)) {
            growthStageIds = req.body.growthStageIds;
        }
        const pestDiseaseData = {
            ...req.body,
            growthStageIds,
        };
        let newPestDisease = await adminService.createPestDiseaseService(pestDiseaseData, req.files);

        return res.status(200).json({
            data: newPestDisease,
        });
    } catch (error) {
        console.error("Error in createPestDisease:", error);
        return res.status(400).json({
            error: error.message || error,
        });
    }
};

let getAllPestDisease = async(req, res) => {
    try{
        let pestDiseaseList = await adminService.getAllPestDiseaseService();
        return res.status(200).json({pestDiseaseList})
    }catch(error){
        return res.status(400).json(error);
    }
}

let getPestDiseaseById = async(req,res) => {
    try{
        let pestDiseaseId = req.params.id;
        let pestDisease = await adminService.getPestDiseaseByIdService(pestDiseaseId);
        if(!pestDisease){
            return res.status(404).json({message: "No pest disease found"})
        } 
        return res.status(200).json({pestDisease})
    }catch(error){
        return res.status(400).json(error)
    }
}   

let updatePestDisease = async(req,res) => {
    try{
        let pestDiseaseId = req.params.id;
        const updateData = req.body;
        try{
            if (typeof updateData.growthStageIds === 'string') {
              updateData.growthStageIds = JSON.parse(updateData.growthStageIds);
            }
          }
          catch (e) {
            return res.status(400).json({ message: 'Invalid growthStageIds format' });      
            }
        let updatedPestDisease = await adminService.updatePestDiseaseService(pestDiseaseId, updateData, req.files);
        if(!updatedPestDisease){
            return res.status(404).json({message: "No pest disease found"})
        }
        return res.status(200).json({updatedPestDisease})
    }catch(error){
        return res.status(400).json(error)
    }
}
let deletePestDisease = async(req,res) => {
    try{
        let pestDiseaseId = req.params.id;
        let deletedPestDisease = await adminService.deletePestDiseaseService(pestDiseaseId);
        if(deletedPestDisease.errCode !== 0){ 
            return res.status(400).json(deletedPestDisease);
        }
        return res.status(200).json(deletedPestDisease);
    }catch(error){
        return res.status(400).json(error)
    }
}   

// Cultivation Technique
let createCultivation = async (req, res) => {
    try {
        let newCultivation = await adminService.createCultivationService(req.body);
        return res.status(200).json(newCultivation);
    } catch (error) {
        console.error("Error in createCultivation:", error);
        return res.status(400).json({
            error: error.message || error,
        });
    }
};

let getAllCultivation = async (req, res) => {
    try {
        let cultivationList = await adminService.getAllCultivationService();
        return res.status(200).json(cultivationList);
    } catch (error) {
        return res.status(400).json(error);
    }
};

let getCultivationById = async (req, res) => {
    try {
        let cultivationId = req.params.id;
        let cultivation = await adminService.getCultivationByIdService(cultivationId);
        if (!cultivation) {
            return res.status(404).json({ message: "No cultivation technique found" });
        }
        return res.status(200).json(cultivation);
    } catch (error) {
        return res.status(400).json(error);
    }
};

let updateCultivation = async (req, res) => {
    try {
        let cultivationId = req.params.id;
        let updatedCultivation = await adminService.updateCultivationService(cultivationId, req.body);
        if (!updatedCultivation) {
            return res.status(404).json({ message: "No cultivation technique found" });
        }
        return res.status(200).json(updatedCultivation);
    } catch (error) {
        return res.status(400).json(error);
    }
};

let deleteCultivation = async (req, res) => {
    try {
        let cultivationId = req.params.id;
        let result = await adminService.deleteCultivationService(cultivationId);
        if (result.errCode !== 0) {
            return res.status(400).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

// Farming Model
let createFarmingModel = async (req, res) => {
    try {
        let newFarmingModel = await adminService.createFarmingModelService(req.body, req.files);
        return res.status(200).json(newFarmingModel);
    } catch (error) {
        console.error("Error in createFarmingModel:", error);
        return res.status(400).json({
            error: error.message || error,
        });
    }
};

let getAllFarmingModel = async (req, res) => {
    try {
        let farmingModelList = await adminService.getAllFarmingModelService();
        return res.status(200).json(farmingModelList);
    } catch (error) {
        return res.status(400).json(error);
    }
};

let getFarmingModelById = async (req, res) => {
    try {
        let farmingId = req.params.id;
        let farmingModel = await adminService.getFarmingModelByIdService(farmingId);
        if (!farmingModel) {
            return res.status(404).json({ message: "No farming model found" });
        }
        return res.status(200).json(farmingModel);
    } catch (error) {
        return res.status(400).json(error);
    }
};

let updateFarmingModel = async (req, res) => {
    try {
        let farmingId = req.params.id;
        let updatedFarmingModel = await adminService.updateFarmingModelService(farmingId, req.body, req.files);
        if (!updatedFarmingModel) {
            return res.status(404).json({ message: "No farming model found" });
        }
        return res.status(200).json(updatedFarmingModel);
    } catch (error) {
        return res.status(400).json(error);
    }
};

let deleteFarmingModel = async (req, res) => {
    try {
        let farmingId = req.params.id;
        let result = await adminService.deleteFarmingModelService(farmingId);
        if (result.errCode !== 0) {
            return res.status(400).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const getTopPestPredictions = async (req, res) => {
    try {
        const result = await adminService.getTopPestPredictionService();
        return res.status(200).json({
            errCode: 0,
            errMessage: 'OK',
            data: result
        });
    } catch (error) {
        console.error('Error getting top pest predictions:', error);
        return res.status(500).json({
            errCode: 1,
            errMessage: 'Error getting top pest predictions',
            error: error.message
        });
    }
};


// ===================== ADMIN - ĐÁNH GIÁ NÔNG TRẠI =====================
let getAllFarmWeeklyUpdates = async (req, res) => {
    try {
        let data = await adminService.getAllFarmWeeklyUpdatesService();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json({ error });
    }
};

let createOrUpdateFarmReview = async (req, res) => {
    try {
        let data = await adminService.createOrUpdateFarmReviewService(req.user.id, req.params.updateId, req.body);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json({ error });
    }
};


// ===================== ADMIN - DANH SÁCH NÔNG TRẠI =====================
let getAllFarms = async (req, res) => {
    try {
        let data = await adminService.getAllFarmsService();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json({ error });
    }
};

module.exports = {
    getAllUser,
    createUser,
    updateUser,
    deleteUser,
    createCafe,
    getAllCafe,
    getCafeById,
    updateCafe,
    deleteCafe,
    createPestDisease,
    getAllPestDisease,  
    getPestDiseaseById,
    updatePestDisease,
    deletePestDisease,
    createCultivation,
    getAllCultivation,
    getCultivationById,
    updateCultivation,
    deleteCultivation,
    createFarmingModel,
    getAllFarmingModel,
    getFarmingModelById,
    updateFarmingModel,
    deleteFarmingModel,
    getTopPestPredictions,  getAllFarmWeeklyUpdates,
  createOrUpdateFarmReview,
    getAllFarms,
};