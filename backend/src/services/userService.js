const db = require("../models/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const imageKit = require('../config/imagekit.js');
const salt = bcrypt.genSaltSync(10);

const checkEmail = async (email) => {
  try {
    const user = await db.User.findOne({ where: { email: email } });
    if (user) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    throw e;
  }
};

let hashPassword = async (password) => {
  try {
    let hashPass = bcrypt.hashSync(password, salt);
    return hashPass;
  } catch (e) {
    throw e;
  }
};

// Đăng ký
let registerService = async (data) => {
  try {
    let isExist = await checkEmail(data.email);
    if (isExist) {
      return {
        errCode: 1,
        errMessage: "Email exists, please try another email!",
      };
    }
    let hashPass = await hashPassword(data.password);
    await db.User.create({
      email: data.email,
      password: hashPass,
      userName: data.username,
      role: "user",
    });
    console.log('abc');

    return {
      errCode: 0,
      errMessage: "Register success",
    };
  } catch (e) {
    console.error("Register error:", e);
    return {
      errCode: -1,
      errMessage: e.message,
    };
  }
};

// Đăng nhập
let loginService = async (data) => {
  try {
    let email = data.email;
    let password = data.password;
    if (!email || !password) {
      return {
        errMessage: "Missing input parameter!",
      };
    }
    let isExist = await checkEmail(email);
    if (!isExist) {
      return {
        errCode: 1,
        errMessage: "Your email is not exist in our system. Please try another email",
      };
    }
    let user = await db.User.findOne({
      attributes: ["id", "email", "password", "userName", "role"],
      where: { email: email },
      raw: true,
    });
    if (!user) {
      return {
        errCode: 1,
        errMessage: "User not found!",
      };
    }
    let check = await bcrypt.compare(password, user.password);
    if (check) {
      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.userName, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return {
        errCode: 0,
        errMessage: "Login success",
        token: token,
        user: {
          id: user.id,
          email: user.email,
          username: user.userName,
          role: user.role,

        }
      };
    } else {
      return {
        errCode: 1,
        errMessage: "Password wrong!",
      };
    }
  } catch (e) {
    throw e;
  }
};
let getCafeTypeService = async () => {
  try {
    let cafeTypes = await db.CafeType.findAll();
    return ({
      errCode: 0,
      errMessage: 'Successfully fetched Cafe Types',
      data: cafeTypes,
    });
  } catch (e) {
    return ({
      errCode: -1,
      errMessage: 'Error while fetching Cafe Types',
      error: e,
    });
  }
}

let getPestDiseasesCategoryService = async () => {
  try {
    let pestDiseasesCategory = await db.PestCategory.findAll();
    return ({
      errCode: 0,
      errMessage: 'Successfully fetched Pest Diseases Category',
      data: pestDiseasesCategory,
    });
  } catch (e) {
    return ({
      errCode: -1,
      errMessage: 'Error while fetching Pest Diseases Category',
      error: e,
    });
  }
}

let getPestDiseasesStagesService = async () => {
  try {
    let pestDiseasesStages = await db.GrowthStage.findAll();
    return ({
      errCode: 0,
      errMessage: 'Successfully fetched Pest Diseases Stages',
      data: pestDiseasesStages,
    });
  } catch (e) {
    return ({
      errCode: -1,
      errMessage: 'Error while fetching Pest Diseases Stages',
      error: e,
    });
  }
}
let pestPredictionService = async (data, files) => {
  if (!files || !files.image || !files.image.data) {
    return {
      errCode: 1,
      errMessage: "Chưa cung cấp ảnh hợp lệ",
    };
  }

  if (!data.userId || !data.predictionLabel || !data.confidenceScore) {
    return {
      errCode: 3,
      errMessage: "Thiếu thông tin đầu vào",
    };
  }

  let imageUrl = '';
  let imageFileId = '';

  try {
    const uploadRes = await imageKit.upload({
      file: files.image.data,
      fileName: files.image.name,
      folder: "/recognition",
    });
    imageUrl = uploadRes.url;
    imageFileId = uploadRes.fileId;
  } catch (err) {
    return {
      errCode: 2,
      errMessage: "Upload ảnh thất bại",
      error: err.message,
    };
  }

  const predictionResult = await db.PestPrediction.create({
    image_path: imageUrl,
    prediction_label: data.predictionLabel,
    confidence_score: data.confidenceScore,
    user_id: data.userId,
  });

  const pestInfo = await db.PestDisease.findOne({
    where: {
      scientific_name: data.predictionLabel,
    },
  });

  return {
    errCode: 0,
    errMessage: "Nhận diện và lưu thành công",
    data: {
      predictionResult,
      pest_info: pestInfo || null,
    },
  };
};



// ===================== NÔNG TRẠI CỦA TÔI =====================
// UserFarm
const createMyFarmService = async (userId, payload) => {
  try {
    const { cafeVarietyId, farmName, location, areaHa, plantedAt, note } = payload;

    if (!cafeVarietyId || !farmName) {
      return { errCode: 1, errMessage: "Thiếu cafeVarietyId hoặc farmName" };
    }

    const variety = await db.CafeVariety.findByPk(cafeVarietyId);
    if (!variety) return { errCode: 2, errMessage: "Không tìm thấy giống cà phê" };

    const farm = await db.UserFarm.create({
      userId,
      cafeVarietyId,
      farmName,
      location: location || null,
      areaHa: areaHa ?? null,
      plantedAt: plantedAt || null,
      note: note || null,
    });

    return { errCode: 0, errMessage: "OK", data: farm };
  } catch (e) {
    return { errCode: -1, errMessage: "Server error", error: e };
  }
};

const getMyFarmsService = async (userId) => {
  try {
    const farms = await db.UserFarm.findAll({
      where: { userId },
      include: [
        { model: db.CafeVariety, as: "cafeVariety", attributes: ["id", "name", "image_url"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    return { errCode: 0, errMessage: "OK", data: farms };
  } catch (e) {
    return { errCode: -1, errMessage: "Server error", error: e };
  }
};

const getFarmUpdatesService = async (userId, farmId) => {
  try {
    const farm = await db.UserFarm.findOne({ where: { id: farmId, userId } });
    if (!farm) return { errCode: 1, errMessage: "Không tìm thấy nông trại" };

    const updates = await db.FarmWeeklyUpdate.findAll({
      where: { farmId },
      include: [
        { model: db.GrowthStage, as: "growthStage", attributes: ["id", "name"] },
        { model: db.FarmUpdateReview, as: "review", include: [{ model: db.User, as: "admin", attributes: ["id", "userName", "email"] }] },
      ],
      order: [["weekStart", "DESC"]],
    });

    return { errCode: 0, errMessage: "OK", data: updates };
  } catch (e) {
    return { errCode: -1, errMessage: "Server error", error: e };
  }
};

// helper: tính ngày thứ 2 của tuần (Asia/Bangkok) từ một ngày bất kỳ
const normalizeToWeekStart = (dateStr) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  // dùng UTC để tránh lệch timezone khi lưu DATEONLY
  const day = d.getUTCDay(); // 0..6 (CN..T7)
  const diff = (day === 0 ? -6 : 1 - day); // về thứ 2
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
};

const upsertWeeklyUpdateService = async (userId, farmId, payload) => {
  try {
    const { weekStart, growthStageId, healthStatus, noteMarkdown, noteHTML, file } = payload;

    const farm = await db.UserFarm.findOne({ where: { id: farmId, userId } });
    if (!farm) return { errCode: 1, errMessage: "Không tìm thấy nông trại" };

    const ws = normalizeToWeekStart(weekStart);
    if (!ws) return { errCode: 2, errMessage: "weekStart không hợp lệ" };

    const existed = await db.FarmWeeklyUpdate.findOne({ where: { farmId, weekStart: ws } });
    if (existed) return { errCode: 3, errMessage: "Tuần này đã cập nhật rồi" };

    let image_url = null;
    let image_file_id = null;

    // ✅ nếu có file (multipart/form-data)
    if (file) {
      const uploadRes = await imageKit.upload({
        file: file.data,        // 👈 giống farming model
        fileName: file.name,
        folder: "/farm_updates",
      });

      image_url = uploadRes.url;
      image_file_id = uploadRes.fileId;
    }

    const record = await db.FarmWeeklyUpdate.create({
      farmId,
      weekStart: ws,
      growthStageId: growthStageId || null,
      healthStatus: healthStatus || "tot",
      noteMarkdown: noteMarkdown || null,
      noteHTML: noteHTML || null,
      image_url,
      image_file_id,
    });

    return { errCode: 0, errMessage: "OK", data: record };
  } catch (e) {
    console.error(e);
    return { errCode: -1, errMessage: "Server error" };
  }
};


module.exports = {
  registerService,
  loginService,
  getCafeTypeService,
  getPestDiseasesCategoryService,
  getPestDiseasesStagesService,
  pestPredictionService, createMyFarmService,
  getMyFarmsService,
  getFarmUpdatesService,
  upsertWeeklyUpdateService,
};
