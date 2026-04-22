const adminService = require('../adminService');
const db = require('../../models/index');
const imageKit = require('../../config/imagekit');

jest.mock('../../models/index');
jest.mock('../../config/imagekit');

describe('pestDiseaseManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============= CREATE PEST DISEASE TESTS (6 tests) =============
  describe('createPestDiseaseService', () => {
    it('TC-PEST-001: should create pest disease successfully with image', async () => {
      const pestData = {
        name: 'Bacterial Leaf Blight',
        scientific_name: 'Xanthomonas campestris',
        description: 'A serious disease',
        descriptionMarkdown: '# Bacterial Leaf Blight',
        descriptionHTML: '<h1>Bacterial Leaf Blight</h1>',
        pestCategoryIds: [1]
      };
      const mockFile = { data: Buffer.from('image'), name: 'blight.jpg' };
      const mockUploadRes = { url: 'https://imagekit.io/blight.jpg', fileId: 'file123' };
      const mockPest = { id: 1, name: pestData.name, setPestCategories: jest.fn() };

      db.PestDisease.findOne.mockResolvedValue(null);
      imageKit.upload.mockResolvedValue(mockUploadRes);
      db.PestDisease.create.mockResolvedValue(mockPest);

      const result = await adminService.createPestDiseaseService(pestData, { image: mockFile });

      expect(db.PestDisease.findOne).toHaveBeenCalled();
      expect(imageKit.upload).toHaveBeenCalled();
      expect(mockPest.setPestCategories).toHaveBeenCalledWith([1]);
      expect(result.errCode).toBe(0);
    });

    it('TC-PEST-002: should create pest disease without image', async () => {
      const pestData = {
        name: 'Brown Spot',
        scientific_name: 'Cercospora coffeicola',
        description: 'Brown spot disease'
      };
      const mockPest = { id: 2, name: pestData.name, setPestCategories: jest.fn() };

      db.PestDisease.findOne.mockResolvedValue(null);
      db.PestDisease.create.mockResolvedValue(mockPest);

      const result = await adminService.createPestDiseaseService(pestData, {});

      expect(imageKit.upload).not.toHaveBeenCalled();
      expect(result.errCode).toBe(0);
    });

    it('TC-PEST-003: should return error when pest disease already exists', async () => {
      const pestData = {
        name: 'Leaf Rust',
        scientific_name: 'Hemileia vastatrix'
      };
      const existingPest = { id: 1, name: 'Leaf Rust' };

      db.PestDisease.findOne.mockResolvedValue(existingPest);

      const result = await adminService.createPestDiseaseService(pestData, {});

      expect(result.errCode).toBe(1);
    });

    it('TC-PEST-004: should handle image upload failure', async () => {
      const pestData = {
        name: 'Anthracnose',
        scientific_name: 'Colletotrichum coffeanum'
      };
      const mockFile = { data: Buffer.from('image'), name: 'anthracnose.jpg' };

      db.PestDisease.findOne.mockResolvedValue(null);
      imageKit.upload.mockRejectedValue(new Error('Upload failed'));

      const result = await adminService.createPestDiseaseService(pestData, { image: mockFile });

      expect(result.errCode).toBe(2);
    });

    it('TC-PEST-005: should not assign pest categories if not provided', async () => {
      const pestData = {
        name: 'Red Mite',
        scientific_name: 'Oligonychus coffeae'
      };
      const mockPest = { id: 3, name: pestData.name, setPestCategories: jest.fn() };

      db.PestDisease.findOne.mockResolvedValue(null);
      db.PestDisease.create.mockResolvedValue(mockPest);

      await adminService.createPestDiseaseService(pestData, {});

      expect(mockPest.setPestCategories).not.toHaveBeenCalled();
    });

    it('TC-PEST-006: should create pest with multiple categories', async () => {
      const pestData = {
        name: 'Coffee Berry Borer',
        scientific_name: 'Hypothenemus hampei',
        pestCategoryIds: [1, 2, 3]
      };
      const mockPest = { id: 4, name: pestData.name, setPestCategories: jest.fn() };

      db.PestDisease.findOne.mockResolvedValue(null);
      db.PestDisease.create.mockResolvedValue(mockPest);

      await adminService.createPestDiseaseService(pestData, {});

      expect(mockPest.setPestCategories).toHaveBeenCalledWith([1, 2, 3]);
    });
  });

  // ============= GET ALL PEST DISEASE TESTS (3 tests) =============
  describe('getAllPestDiseaseService', () => {
    it('TC-PEST-007: should fetch all pest diseases successfully', async () => {
      const mockPests = [
        { id: 1, name: 'Bacterial Leaf Blight', categories: [{ id: 1 }] },
        { id: 2, name: 'Brown Spot', categories: [] }
      ];

      db.PestDisease.findAll.mockResolvedValue(mockPests);

      const result = await adminService.getAllPestDiseaseService();

      expect(db.PestDisease.findAll).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
      expect(result.data).toHaveLength(2);
    });

    it('TC-PEST-008: should return empty array when no pest diseases exist', async () => {
      db.PestDisease.findAll.mockResolvedValue([]);

      const result = await adminService.getAllPestDiseaseService();

      expect(result.errCode).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('TC-PEST-009: should handle database error', async () => {
      db.PestDisease.findAll.mockRejectedValue(new Error('DB error'));

      const result = await adminService.getAllPestDiseaseService();

      expect(result.errCode).toBe(-1);
    });
  });

  // ============= GET PEST DISEASE BY ID TESTS (3 tests) =============
  describe('getPestDiseaseByIdService', () => {
    it('TC-PEST-010: should fetch pest disease by id successfully', async () => {
      const pestId = 1;
      const mockPest = { id: 1, name: 'Bacterial Leaf Blight', scientific_name: 'Xanthomonas' };

      db.PestDisease.findByPk.mockResolvedValue(mockPest);

      const result = await adminService.getPestDiseaseByIdService(pestId);

      expect(db.PestDisease.findByPk).toHaveBeenCalledWith(pestId, expect.any(Object));
      expect(result.errCode).toBe(0);
      expect(result.data).toEqual(mockPest);
    });

    it('TC-PEST-011: should return error when pest disease not found', async () => {
      const pestId = 999;

      db.PestDisease.findByPk.mockResolvedValue(null);

      const result = await adminService.getPestDiseaseByIdService(pestId);

      expect(result.errCode).toBe(1);
    });

    it('TC-PEST-012: should handle database error', async () => {
      const pestId = 1;

      db.PestDisease.findByPk.mockRejectedValue(new Error('DB error'));

      const result = await adminService.getPestDiseaseByIdService(pestId);

      expect(result.errCode).toBe(-1);
    });
  });

  // ============= UPDATE PEST DISEASE TESTS (6 tests) =============
  describe('updatePestDiseaseService', () => {
    it('TC-PEST-013: should update pest disease successfully without image', async () => {
      const pestId = 1;
      const updateData = {
        name: 'Bacterial Leaf Blight Updated',
        description: 'Updated description',
        pestCategoryIds: [1, 2]
      };
      const mockPest = {
        id: 1,
        save: jest.fn().mockResolvedValue(true),
        setPestCategories: jest.fn()
      };

      db.PestDisease.findByPk.mockResolvedValue(mockPest);

      const result = await adminService.updatePestDiseaseService(pestId, updateData, {});

      expect(mockPest.save).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
    });

    it('TC-PEST-014: should update pest disease with new image', async () => {
      const pestId = 1;
      const updateData = { name: 'Brown Spot Updated' };
      const mockFile = { data: Buffer.from('newimage'), name: 'brownspot2.jpg' };
      const mockUploadRes = { url: 'https://imagekit.io/brownspot2.jpg', fileId: 'file456' };
      const mockPest = {
        id: 1,
        image_file_id: 'file123',
        save: jest.fn().mockResolvedValue(true),
        setPestCategories: jest.fn()
      };

      db.PestDisease.findByPk.mockResolvedValue(mockPest);
      imageKit.upload.mockResolvedValue(mockUploadRes);

      const result = await adminService.updatePestDiseaseService(pestId, updateData, { image: mockFile });

      expect(imageKit.upload).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
    });

    it('TC-PEST-015: should return error when pest disease not found', async () => {
      const pestId = 999;
      const updateData = { name: 'Test' };

      db.PestDisease.findByPk.mockResolvedValue(null);

      const result = await adminService.updatePestDiseaseService(pestId, updateData, {});

      expect(result.errCode).toBe(1);
    });

    it('TC-PEST-016: should handle image upload failure during update', async () => {
      const pestId = 1;
      const updateData = { name: 'Updated' };
      const mockFile = { data: Buffer.from('image'), name: 'pest.jpg' };
      const mockPest = { id: 1, image_file_id: 'file123' };

      db.PestDisease.findByPk.mockResolvedValue(mockPest);
      imageKit.upload.mockRejectedValue(new Error('Upload failed'));

      const result = await adminService.updatePestDiseaseService(pestId, updateData, { image: mockFile });

      expect(result.errCode).toBe(2);
    });

    it('TC-PEST-017: should update pest categories when provided', async () => {
      const pestId = 1;
      const updateData = {
        name: 'Updated',
        pestCategoryIds: [2, 3, 4]
      };
      const mockPest = {
        id: 1,
        save: jest.fn().mockResolvedValue(true),
        setPestCategories: jest.fn()
      };

      db.PestDisease.findByPk.mockResolvedValue(mockPest);

      await adminService.updatePestDiseaseService(pestId, updateData, {});

      expect(mockPest.setPestCategories).toHaveBeenCalledWith([2, 3, 4]);
    });

    it('TC-PEST-018: should not update categories when not provided', async () => {
      const pestId = 1;
      const updateData = { name: 'Updated' };
      const mockPest = {
        id: 1,
        save: jest.fn().mockResolvedValue(true),
        setPestCategories: jest.fn()
      };

      db.PestDisease.findByPk.mockResolvedValue(mockPest);

      await adminService.updatePestDiseaseService(pestId, updateData, {});

      expect(mockPest.setPestCategories).not.toHaveBeenCalled();
    });
  });

  // ============= DELETE PEST DISEASE TESTS (5 tests) =============
  describe('deletePestDiseaseService', () => {
    it('TC-PEST-019: should delete pest disease successfully', async () => {
      const pestId = 1;
      const mockPest = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      db.PestDisease.findByPk.mockResolvedValue(mockPest);

      const result = await adminService.deletePestDiseaseService(pestId);

      expect(mockPest.destroy).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
    });

    it('TC-PEST-020: should return error when pest disease not found', async () => {
      const pestId = 999;

      db.PestDisease.findByPk.mockResolvedValue(null);

      const result = await adminService.deletePestDiseaseService(pestId);

      expect(result.errCode).toBe(1);
    });

    it('TC-PEST-021: should handle deletion error', async () => {
      const pestId = 1;
      const mockPest = {
        id: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Delete failed'))
      };

      db.PestDisease.findByPk.mockResolvedValue(mockPest);

      const result = await adminService.deletePestDiseaseService(pestId);

      expect(result.errCode).toBe(-1);
    });

    it('TC-PEST-022: should handle database error', async () => {
      const pestId = 1;

      db.PestDisease.findByPk.mockRejectedValue(new Error('DB error'));

      const result = await adminService.deletePestDiseaseService(pestId);

      expect(result.errCode).toBe(-1);
    });

    it('TC-PEST-023: should delete pest disease with associated categories', async () => {
      const pestId = 1;
      const mockPest = {
        id: 1,
        categories: [{ id: 1 }, { id: 2 }],
        destroy: jest.fn().mockResolvedValue(true)
      };

      db.PestDisease.findByPk.mockResolvedValue(mockPest);

      const result = await adminService.deletePestDiseaseService(pestId);

      expect(result.errCode).toBe(0);
    });
  });
});
