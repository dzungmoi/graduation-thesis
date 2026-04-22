const { raw } = require("body-parser");
const db = require("../models/index.js");
const bcrypt = require("bcryptjs");
const { where } = require("sequelize");
const salt = bcrypt.genSaltSync(10);
const imageKit = require('../config/imagekit.js');
let getAllUserService = async () => {
    try {
        let users = await db.User.findAll();
        return { errCode: 0, errMessage: "OK", data: users };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let createUserService = async (userData) => {
    try {
        let existingUser = await db.User.findOne({ where: { email: userData.email } });
        if (existingUser) {
            return { errCode: 1, errMessage: "Email already exists" };
        }

        let hashedPassword = bcrypt.hashSync(userData.password, salt);
        let newUser = await db.User.create({
            email: userData.email,
            password: hashedPassword,
            userName: userData.username,
            role: userData.role,
            image: userData.image,
        });

        return { errCode: 0, errMessage: "User created successfully", data: newUser };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let updateUserService = async (userId, userData) => {
    try {
        let user = await db.User.findOne({
            where: { id: userId },
            raw: false
        });
        if (user) {
            user.userName = userData.username,
                user.role = userData.role,
                user.image = userData.image

            await user.save();
            return { errCode: 0, errMessage: "User updated successfully", data: user };
        } else {
            return { errCode: 1, errMessage: "User not found" };
        }

        // if (userData.password) {
        //     userData.password = bcrypt.hashSync(userData.password, salt);
        // }


        // return { errCode: 0, errMessage: "User updated successfully", data: user };
    } catch (e) {
        console.log(e)
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let deleteUserService = async (userId) => {
    try {
        let user = await db.User.findOne({
            where: { id: userId },
            raw: false
        })
        if (!user) {
            return { errCode: 1, errMessage: "User not found" };
        }

        await user.destroy();
        return { errCode: 0, errMessage: "User deleted successfully" };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let createCafeService = async (cafeData, files) => {
    console.log(cafeData);
    console.log(files);

    let existingCafe = await db.CafeVariety.findOne({
        where: { name: cafeData.name }
    });
    if (existingCafe) {
        return {
            errCode: 1,
            errMessage: "Giống Cafe đã tồn tại"
        };
    }
    let imageUrl = '';
    let imageFileId = '';
    if (files && files.image) {
        let file = files.image;
        // let uploadRes = await imageKit.upload({
        //     file: file.data,
        //     fileName: file.name,
        //     folder: '/cafe',
        // });
        try {
            let uploadRes = await imageKit.upload({
                file: file.data,
                fileName: file.name,
                folder: '/cafe',
            });
            imageUrl = uploadRes.url;
            imageFileId = uploadRes.fileId;
        } catch (err) {
            console.error("ImageKit upload error:", err);
            return {
                errCode: 2,
                errMessage: "Upload ảnh thất bại",
            };
        }
        // imageUrl = uploadRes.url;
        // imageFileId = uploadRes.fileId;
    }

    let newCafe = await db.CafeVariety.create({
        name: cafeData.name,
        description: cafeData.description,
        descriptionMarkdown: cafeData.descriptionMarkdown,
        descriptionHTML: cafeData.descriptionHTML,
        image_url: imageUrl,
        image_file_id: imageFileId
    });

    // Gán loại cafe (nếu có)
    if (cafeData.cafeTypeIds && Array.isArray(cafeData.cafeTypeIds) && cafeData.cafeTypeIds.length > 0) {
        await newCafe.setCafeTypes(cafeData.cafeTypeIds);
    }

    return {
        errCode: 0,
        message: "New cafe variety created successfully",
        data: newCafe,
    };
};

let getAllCafeService = async () => {
    try {
        let cafes = await db.CafeVariety.findAll({
            include: [
                {
                    model: db.CafeType,
                    as: 'CafeTypes',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ],
            raw: false,
            nest: true,
        });
        return { errCode: 0, errMessage: "OK", data: cafes };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
}

let getCafeByIdService = async (cafeId) => {
    let cafe = await db.CafeVariety.findOne({
        where: { id: cafeId },
        include: [
            {
                model: db.CafeType,
                as: 'CafeTypes',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }
        ],
        raw: false,
        nest: true,
    });
    return { errCode: 0, errMessage: "OK", data: cafe };
}

let updateCafeService = async (cafeId, updateData, files) => {
    try {
        let cafe = await db.CafeVariety.findOne({
            where: { id: cafeId },
            raw: false,
            include: [{ model: db.CafeType, as: 'CafeTypes' }]
        });
        if (!cafe) {
            return {
                errCode: 1,
                errMessage: "Cafe variety not found"
            };
        }
        cafe.name = updateData.name || cafe.name;
        cafe.description = updateData.description || cafe.description;
        cafe.descriptionMarkdown = updateData.descriptionMarkdown || cafe.descriptionMarkdown;
        cafe.descriptionHTML = updateData.descriptionHTML || cafe.descriptionHTML;
        if (files && files.image) {
            const file = Array.isArray(files.image) ? files.image[0] : files.image;
            const oldFileId = cafe.image_file_id;
            const uploadRes = await imageKit.upload({
                file: file.data,
                fileName: file.name,
                folder: '/cafe',
            });

            cafe.image_url = uploadRes.url;
            cafe.image_file_id = uploadRes.fileId;

            if (oldFileId) {
                try {
                    await imageKit.deleteFile(oldFileId);
                } catch (deleteErr) {
                    console.warn("Failed to delete old image:", deleteErr.message);
                }
            }
        }
        if (updateData.cafeTypes && Array.isArray(updateData.cafeTypes)) {
            await cafe.setCafeTypes(updateData.cafeTypes);
        }
        await cafe.save();
        return {
            errCode: 0,
            errMessage: "Cafe variety updated successfully",
            data: cafe.get({ plain: true })
        };
    } catch (e) {
        console.error("Update error:", e);
        return {
            errCode: -1,
            errMessage: "Server error",
            error: e.message
        };
    }
};

let deleteCafeService = async (cafeId) => {
    try {
        let cafe = await db.CafeVariety.findOne({
            where: { id: cafeId },
            include: [{ model: db.CafeType, as: 'CafeTypes' }],
            raw: false
        });

        if (!cafe) {
            return { errCode: 1, errMessage: "Giống cafe không tồn tại!" };
        }

        // Xóa liên kết bảng trung gian
        await cafe.setCafeTypes([]); // xoá quan hệ N:N

        // Xoá ảnh trên ImageKit nếu có
        if (cafe.imageFileId) {  // bạn cần lưu field này khi upload
            try {
                await imagekit.deleteFile(cafe.imageFileId);
            } catch (imgErr) {
                console.warn('Không thể xóa ảnh trên ImageKit:', imgErr.message);
            }
        }

        // Xóa giống cafe
        await cafe.destroy();

        return {
            errCode: 0,
            message: 'Xóa giống cafe thành công!'
        };
    } catch (e) {
        console.error("Delete error:", e);
        return {
            errCode: -1,
            errMessage: "Server error",
            error: e
        };
    }
};
let createPestDiseaseService = async (pestData, files) => {
    try {
        // Kiểm tra sâu bệnh đã tồn tại
        let existingPest = await db.PestDisease.findOne({
            where: { name: pestData.name }
        });
        if (existingPest) {
            return {
                errCode: 1,
                errMessage: "Sâu bệnh đã tồn tại"
            };
        }

        // Xử lý ảnh chính
        let imageUrl = '';
        let imageFileId = '';
        if (files && files.image) {
            let file = files.image;
            let uploadRes = await imageKit.upload({
                file: file.data,
                fileName: file.name,
                folder: '/pests',
            });
            imageUrl = uploadRes.url;
            imageFileId = uploadRes.fileId;
        }

        // Tạo sâu bệnh mới
        let newPest = await db.PestDisease.create({
            name: pestData.name,
            scientific_name: pestData.scientific_name,
            category_id: pestData.category_id,
            descriptionMarkdown: pestData.descriptionMarkdown,
            descriptionHTML: pestData.descriptionHTML,
            image_url: imageUrl,
            image_file_id: imageFileId
        });

        // Xử lý các ảnh phụ
        if (files && files['image-other']) {
            const otherImages = Array.isArray(files['image-other'])
                ? files['image-other']
                : [files['image-other']];

            for (let file of otherImages) {
                let uploadRes = await imageKit.upload({
                    file: file.data,
                    fileName: file.name,
                    folder: '/pests/others',
                });

                await db.PestDiseaseImage.create({
                    pest_id: newPest.id,
                    image_url: uploadRes.url
                });
            }
        }

        // Thêm các giai đoạn sinh trưởng
        if (pestData.growthStageIds && Array.isArray(pestData.growthStageIds) && pestData.growthStageIds.length > 0) {
            // console.log("Assigning growth stages:", pestData.growthStageIds);
            await newPest.setGrowthStages(pestData.growthStageIds);
        }

        // Lấy thông tin đầy đủ của sâu bệnh vừa tạo
        const pestWithDetails = await db.PestDisease.findOne({
            where: { id: newPest.id },
            include: [
                {
                    model: db.PestCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: db.PestDiseaseImage,
                    as: 'images'
                },
                {
                    model: db.GrowthStage,
                    as: 'growthStages',
                    through: { attributes: [] }
                }
            ]
        });

        return {
            errCode: 0,
            message: "Thêm sâu bệnh mới thành công",
            data: pestWithDetails
        };

    } catch (e) {
        console.error("Create pest disease error:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e
        };
    }
};
let getAllPestDiseaseService = async () => {
    try {
        let pests = await db.PestDisease.findAll({
            include: [
                {
                    model: db.PestCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: db.PestDiseaseImage,
                    as: 'images'
                },
                {
                    model: db.GrowthStage,
                    as: 'growthStages',
                    through: { attributes: [] }
                }
            ],
            raw: false,
            nest: true,
        });
        return { errCode: 0, errMessage: "OK", data: pests };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let getPestDiseaseByIdService = async (pestId) => {
    try {
        let pest = await db.PestDisease.findOne({
            where: { id: pestId },
            include: [
                {
                    model: db.PestCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: db.PestDiseaseImage,
                    as: 'images'
                },
                {
                    model: db.GrowthStage,
                    as: 'growthStages',
                    through: { attributes: [] }
                }
            ],
            raw: false,
            nest: true,
        });
        return { errCode: 0, errMessage: "OK", data: pest };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let updatePestDiseaseService = async (pestId, updateData, files) => {
    try {
        let pest = await db.PestDisease.findOne({
            where: { id: pestId },
            raw: false,
            include: [
                { model: db.GrowthStage, as: 'growthStages' },
                { model: db.PestDiseaseImage, as: 'images' }
            ]
        });

        if (!pest) {
            return {
                errCode: 1,
                errMessage: "Sâu bệnh không tồn tại"
            };
        }

        // Cập nhật thông tin cơ bản
        pest.name = updateData.name || pest.name;
        pest.scientific_name = updateData.scientific_name || pest.scientific_name;
        pest.category_id = updateData.category_id || pest.category_id;
        pest.descriptionMarkdown = updateData.descriptionMarkdown || pest.descriptionMarkdown;
        pest.descriptionHTML = updateData.descriptionHTML || pest.descriptionHTML;

        // Xử lý ảnh chính nếu có
        if (files && files.image) {
            const file = Array.isArray(files.image) ? files.image[0] : files.image;
            const oldFileId = pest.image_file_id;

            const uploadRes = await imageKit.upload({
                file: file.data,
                fileName: file.name,
                folder: '/pests',
            });

            pest.image_url = uploadRes.url;
            pest.image_file_id = uploadRes.fileId;

            if (oldFileId) {
                try {
                    await imageKit.deleteFile(oldFileId);
                } catch (deleteErr) {
                    console.warn("Failed to delete old image:", deleteErr.message);
                }
            }
        }

        // Xử lý các ảnh phụ mới nếu có
        if (files && files['image-other']) {
            // Xóa các ảnh phụ cũ
            await db.PestDiseaseImage.destroy({
                where: { pest_id: pestId }
            });

            const otherImages = Array.isArray(files['image-other'])
                ? files['image-other']
                : [files['image-other']];

            for (let file of otherImages) {
                let uploadRes = await imageKit.upload({
                    file: file.data,
                    fileName: file.name,
                    folder: '/pests/others',
                });

                await db.PestDiseaseImage.create({
                    pest_id: pest.id,
                    image_url: uploadRes.url
                });
            }
        }

        // Cập nhật các giai đoạn sinh trưởng
        if (updateData.growthStageIds && Array.isArray(updateData.growthStageIds)) {
            await pest.setGrowthStages(updateData.growthStageIds);
        }

        await pest.save();

        // Lấy thông tin đã cập nhật
        const updatedPest = await db.PestDisease.findOne({
            where: { id: pestId },
            include: [
                {
                    model: db.PestCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: db.PestDiseaseImage,
                    as: 'images'
                },
                {
                    model: db.GrowthStage,
                    as: 'growthStages',
                    through: { attributes: [] }
                }
            ]
        });

        return {
            errCode: 0,
            errMessage: "Cập nhật sâu bệnh thành công",
            data: updatedPest
        };
    } catch (e) {
        console.error("Update error:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e.message
        };
    }
};

let deletePestDiseaseService = async (pestId) => {
    try {
        let pest = await db.PestDisease.findOne({
            where: { id: pestId },
            include: [
                { model: db.GrowthStage, as: 'growthStages' },
                { model: db.PestDiseaseImage, as: 'images' }
            ],
            raw: false
        });

        if (!pest) {
            return { errCode: 1, errMessage: "Sâu bệnh không tồn tại!" };
        }

        // Xóa liên kết với giai đoạn sinh trưởng
        await pest.setGrowthStages([]);

        // Xóa ảnh chính trên ImageKit
        if (pest.image_file_id) {
            try {
                await imageKit.deleteFile(pest.image_file_id);
            } catch (imgErr) {
                console.warn('Không thể xóa ảnh chính trên ImageKit:', imgErr.message);
            }
        }

        // Xóa tất cả ảnh phụ
        await db.PestDiseaseImage.destroy({
            where: { pest_id: pestId }
        });

        // Xóa sâu bệnh
        await pest.destroy();

        return {
            errCode: 0,
            errMessage: 'Xóa sâu bệnh thành công!'
        };
    } catch (e) {
        console.error("Delete error:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e
        };
    }
};

let createCultivationService = async (cultivationData) => {
    try {
        let existingCultivation = await db.CultivationTechnique.findOne({
            where: { variety: cultivationData.variety }
        });
        if (existingCultivation) {
            return {
                errCode: 1,
                errMessage: "Kỹ thuật canh tác cho giống này đã tồn tại"
            };
        }

        let newCultivation = await db.CultivationTechnique.create({
            variety: cultivationData.variety,
            descriptionMarkdown: cultivationData.descriptionMarkdown,
            descriptionHTML: cultivationData.descriptionHTML,
        });

        return {
            errCode: 0,
            message: "Thêm kỹ thuật canh tác mới thành công",
            data: newCultivation
        };
    } catch (e) {
        console.error("Create cultivation error:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e
        };
    }
};

let getAllCultivationService = async () => {
    try {
        let cultivations = await db.CultivationTechnique.findAll();
        return { errCode: 0, errMessage: "OK", data: cultivations };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let getCultivationByIdService = async (cultivationId) => {
    try {
        let cultivation = await db.CultivationTechnique.findOne({
            where: { id: cultivationId }
        });
        return { errCode: 0, errMessage: "OK", data: cultivation };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let updateCultivationService = async (cultivationId, updateData) => {
    try {
        let cultivation = await db.CultivationTechnique.findOne({
            where: { id: cultivationId },
            raw: false
        });

        if (!cultivation) {
            return {
                errCode: 1,
                errMessage: "Không tìm thấy kỹ thuật canh tác"
            };
        }

        cultivation.region = updateData.region || cultivation.region;
        cultivation.variety = updateData.variety || cultivation.variety;
        cultivation.growthStage = updateData.growthStage || cultivation.growthStage;
        cultivation.descriptionMarkdown = updateData.descriptionMarkdown || cultivation.descriptionMarkdown;
        cultivation.descriptionHTML = updateData.descriptionHTML || cultivation.descriptionHTML;

        await cultivation.save();

        return {
            errCode: 0,
            errMessage: "Cập nhật kỹ thuật canh tác thành công",
            data: cultivation
        };
    } catch (e) {
        console.error("Update error:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e.message
        };
    }
};

let deleteCultivationService = async (cultivationId) => {
    try {
        let cultivation = await db.CultivationTechnique.findOne({
            where: { id: cultivationId },
            raw: false
        });

        if (!cultivation) {
            return { errCode: 1, errMessage: "Không tìm thấy kỹ thuật canh tác!" };
        }

        await cultivation.destroy();

        return {
            errCode: 0,
            errMessage: 'Xóa kỹ thuật canh tác thành công!'
        };
    } catch (e) {
        console.error("Delete error:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e
        };
    }
};

// Farming Model Services
let createFarmingModelService = async (farmingData, files) => {
    try {
        let existingFarming = await db.FarmingModel.findOne({
            where: { name: farmingData.name }
        });
        if (existingFarming) {
            return {
                errCode: 1,
                errMessage: "Mô hình canh tác này đã tồn tại"
            };
        }

        let imageUrl = '';
        if (files && files.image) {
            let file = files.image;
            let uploadRes = await imageKit.upload({
                file: file.data,
                fileName: file.name,
                folder: '/farming-models',
            });
            imageUrl = uploadRes.url;
        }

        let newFarming = await db.FarmingModel.create({
            name: farmingData.name,
            region: farmingData.region,
            image: imageUrl,
            descriptionMarkdown: farmingData.descriptionMarkdown,
            descriptionHTML: farmingData.descriptionHTML,
        });

        return {
            errCode: 0,
            message: "Thêm mô hình canh tác mới thành công",
            data: newFarming
        };
    } catch (e) {
        console.error("Create farming model error:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e
        };
    }
};

let getAllFarmingModelService = async () => {
    try {
        let farmingModels = await db.FarmingModel.findAll();
        return { errCode: 0, errMessage: "OK", data: farmingModels };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let getFarmingModelByIdService = async (farmingId) => {
    try {
        let farmingModel = await db.FarmingModel.findOne({
            where: { id: farmingId }
        });
        return { errCode: 0, errMessage: "OK", data: farmingModel };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let updateFarmingModelService = async (farmingId, updateData, files) => {
    try {
        let farmingModel = await db.FarmingModel.findOne({
            where: { id: farmingId },
            raw: false
        });

        if (!farmingModel) {
            return {
                errCode: 1,
                errMessage: "Không tìm thấy mô hình canh tác"
            };
        }

        if (files && files.image) {
            const file = Array.isArray(files.image) ? files.image[0] : files.image;
            let uploadRes = await imageKit.upload({
                file: file.data,
                fileName: file.name,
                folder: '/farming-models',
            });
            farmingModel.image = uploadRes.url;
        }

        farmingModel.name = updateData.name || farmingModel.name;
        farmingModel.region = updateData.region || farmingModel.region;
        farmingModel.descriptionMarkdown = updateData.descriptionMarkdown || farmingModel.descriptionMarkdown;
        farmingModel.descriptionHTML = updateData.descriptionHTML || farmingModel.descriptionHTML;

        await farmingModel.save();

        return {
            errCode: 0,
            errMessage: "Cập nhật mô hình canh tác thành công",
            data: farmingModel
        };
    } catch (e) {
        console.error("Update error:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e.message
        };
    }
};

let deleteFarmingModelService = async (farmingId) => {
    try {
        let farmingModel = await db.FarmingModel.findOne({
            where: { id: farmingId },
            raw: false
        });

        if (!farmingModel) {
            return { errCode: 1, errMessage: "Không tìm thấy mô hình canh tác!" };
        }

        await farmingModel.destroy();

        return {
            errCode: 0,
            errMessage: 'Xóa mô hình canh tác thành công!'
        };
    } catch (e) {
        console.error("Delete error:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e
        };
    }
};

const getTopPestPredictionService = async (limit = 3) => {
    try {
        const topPredictions = await db.PestPrediction.findAll({
            attributes: [
                'prediction_label',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'prediction_count']
            ],
            group: ['prediction_label'],
            order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']],
            limit: limit,
            raw: true
        });

        const formattedResults = await Promise.all(
            topPredictions.map(async (prediction) => {
                const pestInfo = await db.PestDisease.findOne({
                    where: { scientific_name: prediction.prediction_label },
                    attributes: ['name'],
                    raw: true
                });

                return {
                    name: pestInfo ? pestInfo.name : prediction.prediction_label, // Nếu không tìm thấy, dùng tên khoa học
                    scientific_name: prediction.prediction_label,
                    count: parseInt(prediction.prediction_count)
                };
            })
        );

        return {
            errCode: 0,
            errMessage: "OK",
            data: formattedResults
        };

    } catch (e) {
        console.error("Error in getTopPestPredictionService:", e);
        return {
            errCode: -1,
            errMessage: "Lỗi server",
            error: e.toString()
        };
    }
};



// ===================== ADMIN - ĐÁNH GIÁ NÔNG TRẠI =====================
let getAllFarmWeeklyUpdatesService = async () => {
    try {
        const updates = await db.FarmWeeklyUpdate.findAll({
            include: [
                {
                    model: db.UserFarm,
                    as: 'farm',
                    include: [
                        { model: db.User, as: 'user', attributes: ['id', 'userName', 'email'] },
                        { model: db.CafeVariety, as: 'cafeVariety', attributes: ['id', 'name'] },
                    ],
                },
                { model: db.GrowthStage, as: 'growthStage', attributes: ['id', 'name'] },
                { model: db.FarmUpdateReview, as: 'review', include: [{ model: db.User, as: 'admin', attributes: ['id', 'userName', 'email'] }] },
            ],
            order: [['weekStart', 'DESC']],
        });
        return { errCode: 0, errMessage: "OK", data: updates };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

let createOrUpdateFarmReviewService = async (adminId, updateId, payload) => {
    try {
        const { rating, comment } = payload;
        if (!rating) return { errCode: 1, errMessage: "Thiếu rating" };

        const update = await db.FarmWeeklyUpdate.findByPk(updateId);
        if (!update) return { errCode: 2, errMessage: "Không tìm thấy bản cập nhật" };

        const [review, created] = await db.FarmUpdateReview.findOrCreate({
            where: { updateId },
            defaults: { updateId, adminId, rating, comment: comment || null },
        });

        if (!created) {
            await review.update({ adminId, rating, comment: comment ?? review.comment });
        }

        return { errCode: 0, errMessage: "OK", data: review };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};


// ===================== ADMIN - DANH SÁCH NÔNG TRẠI (TẤT CẢ USER) =====================
let getAllFarmsService = async () => {
    try {
        const farms = await db.UserFarm.findAll({
            include: [
                { model: db.User, as: 'user', attributes: ['id', 'userName', 'email'] },
                { model: db.CafeVariety, as: 'cafeVariety', attributes: ['id', 'name'] },
            ],
            order: [['createdAt', 'DESC']],
        });
        return { errCode: 0, errMessage: "OK", data: farms };
    } catch (e) {
        return { errCode: -1, errMessage: "Server error", error: e };
    }
};

module.exports = {
    getAllUserService,
    createUserService,
    updateUserService,
    deleteUserService,
    createCafeService,
    getAllCafeService,
    getCafeByIdService,
    updateCafeService,
    deleteCafeService,
    createPestDiseaseService,
    getAllPestDiseaseService,
    getPestDiseaseByIdService,
    updatePestDiseaseService,
    deletePestDiseaseService,
    createCultivationService,
    getAllCultivationService,
    getCultivationByIdService,
    updateCultivationService,
    deleteCultivationService,
    createFarmingModelService,
    getAllFarmingModelService,
    getFarmingModelByIdService,
    updateFarmingModelService,
    deleteFarmingModelService,
    getTopPestPredictionService,
    getAllFarmWeeklyUpdatesService,
    createOrUpdateFarmReviewService,
    getAllFarmsService,
};
