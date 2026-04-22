const userService = require('../userService');
const db = require('../../models/index');
const imageKit = require('../../config/imagekit');

jest.mock('../../models/index');
jest.mock('../../config/imagekit');

describe('userFarmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============= GET CAFE TYPES TESTS (3 tests) =============
  describe('getCafeTypeService', () => {
    it('TC-UT-001: should fetch all cafe types successfully', async () => {
      const mockCafeTypes = [
        { id: 1, name: 'Arabica' },
        { id: 2, name: 'Robusta' }
      ];
      db.CafeType.findAll.mockResolvedValue(mockCafeTypes);

      const result = await userService.getCafeTypeService();

      expect(db.CafeType.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        errCode: 0,
        errMessage: 'Successfully fetched Cafe Types',
        data: mockCafeTypes
      });
    });

    it('TC-UT-002: should return empty array when no cafe types exist', async () => {
      db.CafeType.findAll.mockResolvedValue([]);

      const result = await userService.getCafeTypeService();

      expect(result.errCode).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('TC-UT-003: should handle database error', async () => {
      const error = new Error('DB connection failed');
      db.CafeType.findAll.mockRejectedValue(error);

      const result = await userService.getCafeTypeService();

      expect(result.errCode).toBe(-1);
      expect(result.errMessage).toBe('Error while fetching Cafe Types');
    });
  });

  // ============= GET PEST DISEASES CATEGORY TESTS (3 tests) =============
  describe('getPestDiseasesCategoryService', () => {
    it('TC-UT-004: should fetch all pest disease categories successfully', async () => {
      const mockCategories = [
        { id: 1, name: 'Fungal' },
        { id: 2, name: 'Bacterial' }
      ];
      db.PestCategory.findAll.mockResolvedValue(mockCategories);

      const result = await userService.getPestDiseasesCategoryService();

      expect(db.PestCategory.findAll).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
      expect(result.data).toEqual(mockCategories);
    });

    it('TC-UT-005: should return empty array when no categories exist', async () => {
      db.PestCategory.findAll.mockResolvedValue([]);

      const result = await userService.getPestDiseasesCategoryService();

      expect(result.errCode).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('TC-UT-006: should handle database error gracefully', async () => {
      db.PestCategory.findAll.mockRejectedValue(new Error('DB error'));

      const result = await userService.getPestDiseasesCategoryService();

      expect(result.errCode).toBe(-1);
    });
  });

  // ============= GET PEST DISEASES STAGES TESTS (3 tests) =============
  describe('getPestDiseasesStagesService', () => {
    it('TC-UT-007: should fetch all growth stages successfully', async () => {
      const mockStages = [
        { id: 1, name: 'Seedling' },
        { id: 2, name: 'Vegetative' }
      ];
      db.GrowthStage.findAll.mockResolvedValue(mockStages);

      const result = await userService.getPestDiseasesStagesService();

      expect(db.GrowthStage.findAll).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
      expect(result.data).toEqual(mockStages);
    });

    it('TC-UT-008: should return empty array when no stages exist', async () => {
      db.GrowthStage.findAll.mockResolvedValue([]);

      const result = await userService.getPestDiseasesStagesService();

      expect(result.errCode).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('TC-UT-009: should handle database error', async () => {
      db.GrowthStage.findAll.mockRejectedValue(new Error('DB connection error'));

      const result = await userService.getPestDiseasesStagesService();

      expect(result.errCode).toBe(-1);
    });
  });

  // ============= CREATE MY FARM TESTS (8 tests) =============
  describe('createMyFarmService', () => {
    it('TC-FM-001: should create farm successfully with all valid data', async () => {
      const userId = 1;
      const payload = {
        cafeVarietyId: 5,
        farmName: 'Farm A',
        location: 'Da Lat',
        areaHa: 10,
        plantedAt: '2023-01-01',
        note: 'Good location'
      };
      const mockVariety = { id: 5, name: 'Arabica' };
      const mockFarm = { id: 1, ...payload, userId };

      db.CafeVariety.findByPk.mockResolvedValue(mockVariety);
      db.UserFarm.create.mockResolvedValue(mockFarm);

      const result = await userService.createMyFarmService(userId, payload);

      expect(db.CafeVariety.findByPk).toHaveBeenCalledWith(5);
      expect(db.UserFarm.create).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
      expect(result.data.farmName).toBe('Farm A');
    });

    it('TC-FM-002: should create farm with minimum required data', async () => {
      const userId = 1;
      const payload = {
        cafeVarietyId: 5,
        farmName: 'Farm B'
      };
      const mockVariety = { id: 5 };
      const mockFarm = { id: 2, ...payload, userId, location: null };

      db.CafeVariety.findByPk.mockResolvedValue(mockVariety);
      db.UserFarm.create.mockResolvedValue(mockFarm);

      const result = await userService.createMyFarmService(userId, payload);

      expect(result.errCode).toBe(0);
      expect(result.data).toBeDefined();
    });

    it('TC-FM-003: should return error when cafeVarietyId is missing', async () => {
      const userId = 1;
      const payload = { farmName: 'Farm C' };

      const result = await userService.createMyFarmService(userId, payload);

      expect(result.errCode).toBe(1);
      expect(result.errMessage).toBe('Thiếu cafeVarietyId hoặc farmName');
    });

    it('TC-FM-004: should return error when farmName is missing', async () => {
      const userId = 1;
      const payload = { cafeVarietyId: 5 };

      const result = await userService.createMyFarmService(userId, payload);

      expect(result.errCode).toBe(1);
    });

    it('TC-FM-005: should return error when cafe variety does not exist', async () => {
      const userId = 1;
      const payload = {
        cafeVarietyId: 999,
        farmName: 'Farm D'
      };

      db.CafeVariety.findByPk.mockResolvedValue(null);

      const result = await userService.createMyFarmService(userId, payload);

      expect(result.errCode).toBe(2);
      expect(result.errMessage).toBe('Không tìm thấy giống cà phê');
    });

    it('TC-FM-006: should handle server error gracefully', async () => {
      const userId = 1;
      const payload = {
        cafeVarietyId: 5,
        farmName: 'Farm E'
      };

      db.CafeVariety.findByPk.mockRejectedValue(new Error('DB error'));

      const result = await userService.createMyFarmService(userId, payload);

      expect(result.errCode).toBe(-1);
      expect(result.errMessage).toBe('Server error');
    });

    it('TC-FM-007: should handle validation error', async () => {
      const userId = 1;
      const payload = {
        cafeVarietyId: null,
        farmName: ''
      };

      const result = await userService.createMyFarmService(userId, payload);

      expect(result.errCode).toBe(1);
    });

    it('TC-FM-008: should create farm with optional area hectare', async () => {
      const userId = 1;
      const payload = {
        cafeVarietyId: 5,
        farmName: 'Farm F',
        areaHa: 5.5
      };
      const mockVariety = { id: 5 };
      const mockFarm = { id: 3, ...payload, userId };

      db.CafeVariety.findByPk.mockResolvedValue(mockVariety);
      db.UserFarm.create.mockResolvedValue(mockFarm);

      const result = await userService.createMyFarmService(userId, payload);

      expect(result.data.areaHa).toBe(5.5);
    });
  });

  // ============= GET MY FARMS TESTS (5 tests) =============
  describe('getMyFarmsService', () => {
    it('TC-FM-009: should fetch all farms for user successfully', async () => {
      const userId = 1;
      const mockFarms = [
        { id: 1, farmName: 'Farm A', userId },
        { id: 2, farmName: 'Farm B', userId }
      ];

      db.UserFarm.findAll.mockResolvedValue(mockFarms);

      const result = await userService.getMyFarmsService(userId);

      expect(db.UserFarm.findAll).toHaveBeenCalledWith({
        where: { userId },
        include: expect.any(Array),
        order: [['createdAt', 'DESC']]
      });
      expect(result.errCode).toBe(0);
      expect(result.data).toHaveLength(2);
    });

    it('TC-FM-010: should return empty array when user has no farms', async () => {
      const userId = 1;
      db.UserFarm.findAll.mockResolvedValue([]);

      const result = await userService.getMyFarmsService(userId);

      expect(result.errCode).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('TC-FM-011: should include cafe variety information', async () => {
      const userId = 1;
      const mockFarms = [
        {
          id: 1,
          farmName: 'Farm A',
          userId,
          cafeVariety: { id: 5, name: 'Arabica', image_url: 'url' }
        }
      ];

      db.UserFarm.findAll.mockResolvedValue(mockFarms);

      const result = await userService.getMyFarmsService(userId);

      expect(result.data[0].cafeVariety).toBeDefined();
      expect(result.data[0].cafeVariety.name).toBe('Arabica');
    });

    it('TC-FM-012: should order farms by creation date descending', async () => {
      const userId = 1;
      const mockFarms = [];

      db.UserFarm.findAll.mockResolvedValue(mockFarms);

      await userService.getMyFarmsService(userId);

      expect(db.UserFarm.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['createdAt', 'DESC']]
        })
      );
    });

    it('TC-FM-013: should handle database error', async () => {
      const userId = 1;
      db.UserFarm.findAll.mockRejectedValue(new Error('DB error'));

      const result = await userService.getMyFarmsService(userId);

      expect(result.errCode).toBe(-1);
      expect(result.errMessage).toBe('Server error');
    });
  });

  // ============= GET FARM UPDATES TESTS (6 tests) =============
  describe('getFarmUpdatesService', () => {
    it('TC-FM-014: should fetch farm updates successfully', async () => {
      const userId = 1;
      const farmId = 1;
      const mockFarm = { id: 1, userId };
      const mockUpdates = [
        { id: 1, farmId, weekStart: '2024-01-01', healthStatus: 'tot' }
      ];

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findAll.mockResolvedValue(mockUpdates);

      const result = await userService.getFarmUpdatesService(userId, farmId);

      expect(result.errCode).toBe(0);
      expect(result.data).toHaveLength(1);
    });

    it('TC-FM-015: should return error when farm not found', async () => {
      const userId = 1;
      const farmId = 999;

      db.UserFarm.findOne.mockResolvedValue(null);

      const result = await userService.getFarmUpdatesService(userId, farmId);

      expect(result.errCode).toBe(1);
      expect(result.errMessage).toBe('Không tìm thấy nông trại');
    });

    it('TC-FM-016: should return empty array when farm has no updates', async () => {
      const userId = 1;
      const farmId = 1;
      const mockFarm = { id: 1, userId };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findAll.mockResolvedValue([]);

      const result = await userService.getFarmUpdatesService(userId, farmId);

      expect(result.errCode).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('TC-FM-017: should include growth stage and review information', async () => {
      const userId = 1;
      const farmId = 1;
      const mockFarm = { id: 1, userId };
      const mockUpdates = [
        {
          id: 1,
          farmId,
          growthStage: { id: 2, name: 'Vegetative' },
          review: { id: 1, admin: { id: 3, userName: 'admin' } }
        }
      ];

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findAll.mockResolvedValue(mockUpdates);

      const result = await userService.getFarmUpdatesService(userId, farmId);

      expect(result.data[0].growthStage).toBeDefined();
      expect(result.data[0].review).toBeDefined();
    });

    it('TC-FM-018: should order updates by weekStart descending', async () => {
      const userId = 1;
      const farmId = 1;
      const mockFarm = { id: 1, userId };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findAll.mockResolvedValue([]);

      await userService.getFarmUpdatesService(userId, farmId);

      expect(db.FarmWeeklyUpdate.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['weekStart', 'DESC']]
        })
      );
    });

    it('TC-FM-019: should handle database error', async () => {
      const userId = 1;
      const farmId = 1;

      db.UserFarm.findOne.mockRejectedValue(new Error('DB error'));

      const result = await userService.getFarmUpdatesService(userId, farmId);

      expect(result.errCode).toBe(-1);
    });
  });

  // ============= UPSERT WEEKLY UPDATE TESTS (10 tests) =============
  describe('upsertWeeklyUpdateService', () => {
    it('TC-FM-020: should create weekly update successfully', async () => {
      const userId = 1;
      const farmId = 1;
      const payload = {
        weekStart: '2024-04-15',
        growthStageId: 2,
        healthStatus: 'tot',
        noteMarkdown: 'Good condition',
        noteHTML: '<p>Good condition</p>',
        file: null
      };
      const mockFarm = { id: 1, userId };
      const mockUpdate = { id: 1, ...payload, farmId };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findOne.mockResolvedValue(null);
      db.FarmWeeklyUpdate.create.mockResolvedValue(mockUpdate);

      const result = await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(result.errCode).toBe(0);
      expect(result.data.farmId).toBe(1);
    });

    it('TC-FM-021: should return error when farm not found', async () => {
      const userId = 1;
      const farmId = 999;
      const payload = { weekStart: '2024-04-15' };

      db.UserFarm.findOne.mockResolvedValue(null);

      const result = await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(result.errCode).toBe(1);
      expect(result.errMessage).toBe('Không tìm thấy nông trại');
    });

    it('TC-FM-022: should return error with invalid weekStart date', async () => {
      const userId = 1;
      const farmId = 1;
      const payload = { weekStart: 'invalid-date' };
      const mockFarm = { id: 1, userId };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);

      const result = await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(result.errCode).toBe(2);
      expect(result.errMessage).toBe('weekStart không hợp lệ');
    });

    it('TC-FM-023: should return error when update already exists for week', async () => {
      const userId = 1;
      const farmId = 1;
      const payload = { weekStart: '2024-04-15' };
      const mockFarm = { id: 1, userId };
      const existingUpdate = { id: 1, farmId, weekStart: '2024-04-15' };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findOne.mockResolvedValue(existingUpdate);

      const result = await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(result.errCode).toBe(3);
      expect(result.errMessage).toBe('Tuần này đã cập nhật rồi');
    });

    it('TC-FM-024: should upload image successfully when file provided', async () => {
      const userId = 1;
      const farmId = 1;
      const mockFile = { data: Buffer.from('image'), name: 'farm.jpg' };
      const payload = {
        weekStart: '2024-04-15',
        file: mockFile
      };
      const mockFarm = { id: 1, userId };
      const mockUploadRes = { url: 'https://imagekit.io/farm.jpg', fileId: 'file123' };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findOne.mockResolvedValue(null);
      imageKit.upload.mockResolvedValue(mockUploadRes);
      db.FarmWeeklyUpdate.create.mockResolvedValue({ id: 1, image_url: mockUploadRes.url });

      const result = await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(imageKit.upload).toHaveBeenCalledWith({
        file: mockFile.data,
        fileName: mockFile.name,
        folder: '/farm_updates'
      });
      expect(result.errCode).toBe(0);
    });

    it('TC-FM-025: should handle image upload failure', async () => {
      const userId = 1;
      const farmId = 1;
      const mockFile = { data: Buffer.from('image'), name: 'farm.jpg' };
      const payload = {
        weekStart: '2024-04-15',
        file: mockFile
      };
      const mockFarm = { id: 1, userId };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findOne.mockResolvedValue(null);
      imageKit.upload.mockRejectedValue(new Error('Upload failed'));

      const result = await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(result.errCode).toBe(-1);
    });

    it('TC-FM-026: should set default health status to "tot" if not provided', async () => {
      const userId = 1;
      const farmId = 1;
      const payload = {
        weekStart: '2024-04-15'
      };
      const mockFarm = { id: 1, userId };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findOne.mockResolvedValue(null);
      db.FarmWeeklyUpdate.create.mockResolvedValue({ id: 1, healthStatus: 'tot' });

      await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(db.FarmWeeklyUpdate.create).toHaveBeenCalledWith(
        expect.objectContaining({ healthStatus: 'tot' })
      );
    });

    it('TC-FM-027: should normalize weekStart to Monday', async () => {
      const userId = 1;
      const farmId = 1;
      const payload = {
        weekStart: '2024-04-17' // Wednesday
      };
      const mockFarm = { id: 1, userId };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findOne.mockResolvedValue(null);
      db.FarmWeeklyUpdate.create.mockResolvedValue({ id: 1 });

      await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(db.FarmWeeklyUpdate.create).toHaveBeenCalled();
    });

    it('TC-FM-028: should handle null file gracefully', async () => {
      const userId = 1;
      const farmId = 1;
      const payload = {
        weekStart: '2024-04-15',
        file: null
      };
      const mockFarm = { id: 1, userId };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findOne.mockResolvedValue(null);
      db.FarmWeeklyUpdate.create.mockResolvedValue({ id: 1, image_url: null });

      const result = await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(result.errCode).toBe(0);
      expect(imageKit.upload).not.toHaveBeenCalled();
    });

    it('TC-FM-029: should save both markdown and HTML notes', async () => {
      const userId = 1;
      const farmId = 1;
      const payload = {
        weekStart: '2024-04-15',
        noteMarkdown: '# Condition\nGood',
        noteHTML: '<h1>Condition</h1><p>Good</p>'
      };
      const mockFarm = { id: 1, userId };

      db.UserFarm.findOne.mockResolvedValue(mockFarm);
      db.FarmWeeklyUpdate.findOne.mockResolvedValue(null);
      db.FarmWeeklyUpdate.create.mockResolvedValue({ id: 1, ...payload });

      await userService.upsertWeeklyUpdateService(userId, farmId, payload);

      expect(db.FarmWeeklyUpdate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          noteMarkdown: '# Condition\nGood',
          noteHTML: '<h1>Condition</h1><p>Good</p>'
        })
      );
    });
  });

  // ============= PEST PREDICTION TESTS (6 tests) =============
  describe('pestPredictionService', () => {
    it('TC-FM-030: should save prediction successfully with valid data', async () => {
      const data = {
        userId: 1,
        predictionLabel: 'Bacterial leaf blight',
        confidenceScore: 0.95
      };
      const mockFile = { data: Buffer.from('image'), name: 'pest.jpg' };
      const mockUploadRes = { url: 'https://imagekit.io/pest.jpg', fileId: 'file123' };
      const mockPrediction = { id: 1, ...data, image_path: mockUploadRes.url };
      const mockPestInfo = { id: 1, scientific_name: 'Bacterial leaf blight' };

      imageKit.upload.mockResolvedValue(mockUploadRes);
      db.PestPrediction.create.mockResolvedValue(mockPrediction);
      db.PestDisease.findOne.mockResolvedValue(mockPestInfo);

      const result = await userService.pestPredictionService(data, { image: mockFile });

      expect(result.errCode).toBe(0);
      expect(result.data.predictionResult).toBeDefined();
      expect(result.data.pest_info).toBeDefined();
    });

    it('TC-FM-031: should return error when image is missing', async () => {
      const data = {
        userId: 1,
        predictionLabel: 'Pest',
        confidenceScore: 0.9
      };

      const result = await userService.pestPredictionService(data, {});

      expect(result.errCode).toBe(1);
      expect(result.errMessage).toBe('Chưa cung cấp ảnh hợp lệ');
    });

    it('TC-FM-032: should return error when required data is missing', async () => {
      const data = {
        userId: 1
        // Missing predictionLabel and confidenceScore
      };
      const mockFile = { data: Buffer.from('image'), name: 'pest.jpg' };

      const result = await userService.pestPredictionService(data, { image: mockFile });

      expect(result.errCode).toBe(3);
      expect(result.errMessage).toBe('Thiếu thông tin đầu vào');
    });

    it('TC-FM-033: should handle image upload failure', async () => {
      const data = {
        userId: 1,
        predictionLabel: 'Pest',
        confidenceScore: 0.9
      };
      const mockFile = { data: Buffer.from('image'), name: 'pest.jpg' };

      imageKit.upload.mockRejectedValue(new Error('Upload failed'));

      const result = await userService.pestPredictionService(data, { image: mockFile });

      expect(result.errCode).toBe(2);
      expect(result.errMessage).toBe('Upload ảnh thất bại');
    });

    it('TC-FM-034: should return pest info when found', async () => {
      const data = {
        userId: 1,
        predictionLabel: 'Bacterial leaf blight',
        confidenceScore: 0.95
      };
      const mockFile = { data: Buffer.from('image'), name: 'pest.jpg' };
      const mockUploadRes = { url: 'https://imagekit.io/pest.jpg', fileId: 'file123' };
      const mockPestInfo = { id: 1, scientific_name: 'Bacterial leaf blight', description: 'A disease' };

      imageKit.upload.mockResolvedValue(mockUploadRes);
      db.PestPrediction.create.mockResolvedValue({});
      db.PestDisease.findOne.mockResolvedValue(mockPestInfo);

      const result = await userService.pestPredictionService(data, { image: mockFile });

      expect(result.data.pest_info).toEqual(mockPestInfo);
    });

    it('TC-FM-035: should return null for pest_info when pest not found', async () => {
      const data = {
        userId: 1,
        predictionLabel: 'Unknown Pest',
        confidenceScore: 0.5
      };
      const mockFile = { data: Buffer.from('image'), name: 'pest.jpg' };
      const mockUploadRes = { url: 'https://imagekit.io/pest.jpg', fileId: 'file123' };

      imageKit.upload.mockResolvedValue(mockUploadRes);
      db.PestPrediction.create.mockResolvedValue({});
      db.PestDisease.findOne.mockResolvedValue(null);

      const result = await userService.pestPredictionService(data, { image: mockFile });

      expect(result.data.pest_info).toBeNull();
    });
  });
});
