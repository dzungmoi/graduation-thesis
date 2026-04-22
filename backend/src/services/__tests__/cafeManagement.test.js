const adminService = require('../adminService');
const db = require('../../models/index');
const imageKit = require('../../config/imagekit');

jest.mock('../../models/index');
jest.mock('../../config/imagekit');

describe('cafeManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============= CREATE CAFE TESTS (6 tests) =============
  describe('createCafeService', () => {
    it('TC-CAFE-001: should create cafe variety successfully with image', async () => {
      const cafeData = {
        name: 'Arabica Premium',
        description: 'High quality arabica',
        descriptionMarkdown: '# Arabica',
        descriptionHTML: '<h1>Arabica</h1>',
        cafeTypeIds: [1, 2]
      };
      const mockFile = { data: Buffer.from('image'), name: 'arabica.jpg' };
      const mockUploadRes = { url: 'https://imagekit.io/arabica.jpg', fileId: 'file123' };
      const mockCafe = { id: 1, name: cafeData.name, setCafeTypes: jest.fn() };

      db.CafeVariety.findOne.mockResolvedValue(null);
      imageKit.upload.mockResolvedValue(mockUploadRes);
      db.CafeVariety.create.mockResolvedValue(mockCafe);

      const result = await adminService.createCafeService(cafeData, { image: mockFile });

      expect(db.CafeVariety.findOne).toHaveBeenCalledWith({
        where: { name: cafeData.name }
      });
      expect(imageKit.upload).toHaveBeenCalled();
      expect(mockCafe.setCafeTypes).toHaveBeenCalledWith([1, 2]);
      expect(result.errCode).toBe(0);
    });

    it('TC-CAFE-002: should create cafe without image', async () => {
      const cafeData = {
        name: 'Robusta',
        description: 'Robusta variety',
        descriptionMarkdown: '# Robusta',
        descriptionHTML: '<h1>Robusta</h1>'
      };
      const mockCafe = { id: 2, name: cafeData.name, setCafeTypes: jest.fn() };

      db.CafeVariety.findOne.mockResolvedValue(null);
      db.CafeVariety.create.mockResolvedValue(mockCafe);

      const result = await adminService.createCafeService(cafeData, {});

      expect(imageKit.upload).not.toHaveBeenCalled();
      expect(result.errCode).toBe(0);
    });

    it('TC-CAFE-003: should return error when cafe name already exists', async () => {
      const cafeData = {
        name: 'Arabica',
        description: 'Test'
      };
      const existingCafe = { id: 1, name: 'Arabica' };

      db.CafeVariety.findOne.mockResolvedValue(existingCafe);

      const result = await adminService.createCafeService(cafeData, {});

      expect(result.errCode).toBe(1);
      expect(result.errMessage).toBe('Giống Cafe đã tồn tại');
    });

    it('TC-CAFE-004: should handle image upload failure', async () => {
      const cafeData = {
        name: 'Liberica',
        description: 'Liberica variety'
      };
      const mockFile = { data: Buffer.from('image'), name: 'liberica.jpg' };

      db.CafeVariety.findOne.mockResolvedValue(null);
      imageKit.upload.mockRejectedValue(new Error('Upload failed'));

      const result = await adminService.createCafeService(cafeData, { image: mockFile });

      expect(result.errCode).toBe(2);
      expect(result.errMessage).toBe('Upload ảnh thất bại');
    });

    it('TC-CAFE-005: should not assign cafe types if not provided', async () => {
      const cafeData = {
        name: 'Excelsa',
        description: 'Excelsa variety'
      };
      const mockCafe = { id: 3, name: cafeData.name, setCafeTypes: jest.fn() };

      db.CafeVariety.findOne.mockResolvedValue(null);
      db.CafeVariety.create.mockResolvedValue(mockCafe);

      await adminService.createCafeService(cafeData, {});

      expect(mockCafe.setCafeTypes).not.toHaveBeenCalled();
    });

    it('TC-CAFE-006: should not assign cafe types if empty array provided', async () => {
      const cafeData = {
        name: 'Typica',
        description: 'Typica variety',
        cafeTypeIds: []
      };
      const mockCafe = { id: 4, name: cafeData.name, setCafeTypes: jest.fn() };

      db.CafeVariety.findOne.mockResolvedValue(null);
      db.CafeVariety.create.mockResolvedValue(mockCafe);

      await adminService.createCafeService(cafeData, {});

      expect(mockCafe.setCafeTypes).not.toHaveBeenCalled();
    });
  });

  // ============= GET ALL CAFE TESTS (3 tests) =============
  describe('getAllCafeService', () => {
    it('TC-CAFE-007: should fetch all cafes successfully with associations', async () => {
      const mockCafes = [
        { id: 1, name: 'Arabica', cafeTypes: [{ id: 1, name: 'Type1' }] },
        { id: 2, name: 'Robusta', cafeTypes: [] }
      ];

      db.CafeVariety.findAll.mockResolvedValue(mockCafes);

      const result = await adminService.getAllCafeService();

      expect(db.CafeVariety.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.any(Array)
        })
      );
      expect(result.errCode).toBe(0);
      expect(result.data).toHaveLength(2);
    });

    it('TC-CAFE-008: should return empty array when no cafes exist', async () => {
      db.CafeVariety.findAll.mockResolvedValue([]);

      const result = await adminService.getAllCafeService();

      expect(result.errCode).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('TC-CAFE-009: should handle database error', async () => {
      db.CafeVariety.findAll.mockRejectedValue(new Error('DB error'));

      const result = await adminService.getAllCafeService();

      expect(result.errCode).toBe(-1);
    });
  });

  // ============= GET CAFE BY ID TESTS (3 tests) =============
  describe('getCafeByIdService', () => {
    it('TC-CAFE-010: should fetch cafe by id successfully', async () => {
      const cafeId = 1;
      const mockCafe = { id: 1, name: 'Arabica', description: 'High quality' };

      db.CafeVariety.findByPk.mockResolvedValue(mockCafe);

      const result = await adminService.getCafeByIdService(cafeId);

      expect(db.CafeVariety.findByPk).toHaveBeenCalledWith(cafeId, expect.any(Object));
      expect(result.errCode).toBe(0);
      expect(result.data).toEqual(mockCafe);
    });

    it('TC-CAFE-011: should return error when cafe not found', async () => {
      const cafeId = 999;

      db.CafeVariety.findByPk.mockResolvedValue(null);

      const result = await adminService.getCafeByIdService(cafeId);

      expect(result.errCode).toBe(1);
      expect(result.errMessage).toBe('Cafe variety not found');
    });

    it('TC-CAFE-012: should handle database error', async () => {
      const cafeId = 1;

      db.CafeVariety.findByPk.mockRejectedValue(new Error('DB error'));

      const result = await adminService.getCafeByIdService(cafeId);

      expect(result.errCode).toBe(-1);
    });
  });

  // ============= UPDATE CAFE TESTS (6 tests) =============
  describe('updateCafeService', () => {
    it('TC-CAFE-013: should update cafe successfully without image change', async () => {
      const cafeId = 1;
      const updateData = {
        name: 'Arabica Updated',
        description: 'Updated description',
        cafeTypeIds: [1]
      };
      const mockCafe = {
        id: 1,
        name: 'Arabica',
        save: jest.fn().mockResolvedValue(true),
        setCafeTypes: jest.fn()
      };

      db.CafeVariety.findByPk.mockResolvedValue(mockCafe);

      const result = await adminService.updateCafeService(cafeId, updateData, {});

      expect(mockCafe.save).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
    });

    it('TC-CAFE-014: should update cafe with new image', async () => {
      const cafeId = 1;
      const updateData = {
        name: 'Arabica Updated'
      };
      const mockFile = { data: Buffer.from('newimage'), name: 'arabica2.jpg' };
      const mockUploadRes = { url: 'https://imagekit.io/arabica2.jpg', fileId: 'file456' };
      const mockCafe = {
        id: 1,
        image_file_id: 'file123',
        save: jest.fn().mockResolvedValue(true),
        setCafeTypes: jest.fn()
      };

      db.CafeVariety.findByPk.mockResolvedValue(mockCafe);
      imageKit.upload.mockResolvedValue(mockUploadRes);

      const result = await adminService.updateCafeService(cafeId, updateData, { image: mockFile });

      expect(imageKit.upload).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
    });

    it('TC-CAFE-015: should return error when cafe not found', async () => {
      const cafeId = 999;
      const updateData = { name: 'Test' };

      db.CafeVariety.findByPk.mockResolvedValue(null);

      const result = await adminService.updateCafeService(cafeId, updateData, {});

      expect(result.errCode).toBe(1);
      expect(result.errMessage).toBe('Cafe variety not found');
    });

    it('TC-CAFE-016: should handle image upload failure during update', async () => {
      const cafeId = 1;
      const updateData = { name: 'Updated' };
      const mockFile = { data: Buffer.from('image'), name: 'cafe.jpg' };
      const mockCafe = { id: 1, image_file_id: 'file123' };

      db.CafeVariety.findByPk.mockResolvedValue(mockCafe);
      imageKit.upload.mockRejectedValue(new Error('Upload failed'));

      const result = await adminService.updateCafeService(cafeId, updateData, { image: mockFile });

      expect(result.errCode).toBe(2);
    });

    it('TC-CAFE-017: should update cafe types when provided', async () => {
      const cafeId = 1;
      const updateData = {
        name: 'Updated',
        cafeTypeIds: [2, 3]
      };
      const mockCafe = {
        id: 1,
        save: jest.fn().mockResolvedValue(true),
        setCafeTypes: jest.fn()
      };

      db.CafeVariety.findByPk.mockResolvedValue(mockCafe);

      await adminService.updateCafeService(cafeId, updateData, {});

      expect(mockCafe.setCafeTypes).toHaveBeenCalledWith([2, 3]);
    });

    it('TC-CAFE-018: should not update cafe types when not provided', async () => {
      const cafeId = 1;
      const updateData = { name: 'Updated' };
      const mockCafe = {
        id: 1,
        save: jest.fn().mockResolvedValue(true),
        setCafeTypes: jest.fn()
      };

      db.CafeVariety.findByPk.mockResolvedValue(mockCafe);

      await adminService.updateCafeService(cafeId, updateData, {});

      expect(mockCafe.setCafeTypes).not.toHaveBeenCalled();
    });
  });

  // ============= DELETE CAFE TESTS (5 tests) =============
  describe('deleteCafeService', () => {
    it('TC-CAFE-019: should delete cafe successfully', async () => {
      const cafeId = 1;
      const mockCafe = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      db.CafeVariety.findByPk.mockResolvedValue(mockCafe);

      const result = await adminService.deleteCafeService(cafeId);

      expect(mockCafe.destroy).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
    });

    it('TC-CAFE-020: should return error when cafe not found', async () => {
      const cafeId = 999;

      db.CafeVariety.findByPk.mockResolvedValue(null);

      const result = await adminService.deleteCafeService(cafeId);

      expect(result.errCode).toBe(1);
      expect(result.errMessage).toBe('Cafe variety not found');
    });

    it('TC-CAFE-021: should handle deletion error', async () => {
      const cafeId = 1;
      const mockCafe = {
        id: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Delete failed'))
      };

      db.CafeVariety.findByPk.mockResolvedValue(mockCafe);

      const result = await adminService.deleteCafeService(cafeId);

      expect(result.errCode).toBe(-1);
    });

    it('TC-CAFE-022: should handle database error', async () => {
      const cafeId = 1;

      db.CafeVariety.findByPk.mockRejectedValue(new Error('DB error'));

      const result = await adminService.deleteCafeService(cafeId);

      expect(result.errCode).toBe(-1);
    });

    it('TC-CAFE-023: should delete cafe with associated types', async () => {
      const cafeId = 1;
      const mockCafe = {
        id: 1,
        cafeTypes: [{ id: 1 }, { id: 2 }],
        destroy: jest.fn().mockResolvedValue(true)
      };

      db.CafeVariety.findByPk.mockResolvedValue(mockCafe);

      const result = await adminService.deleteCafeService(cafeId);

      expect(result.errCode).toBe(0);
    });
  });
});
