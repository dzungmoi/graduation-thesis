const adminService = require('../adminService');
const db = require('../../models/index');

jest.mock('../../models/index');

describe('cultivationTechnique', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============= CREATE CULTIVATION TECHNIQUE TESTS (4 tests) =============
  describe('createCultivationService', () => {
    it('TC-CULT-001: should create cultivation technique successfully', async () => {
      const cultivationData = {
        name: 'Shade Growing',
        description: 'Growing coffee under shade trees',
        descriptionMarkdown: '# Shade Growing\nBenefits: ...',
        descriptionHTML: '<h1>Shade Growing</h1><p>Benefits: ...</p>',
        cafeVarietyIds: [1, 2]
      };
      const mockTechnique = { id: 1, name: cultivationData.name, setCafeVarieties: jest.fn() };

      db.CultivationTechnique.findOne.mockResolvedValue(null);
      db.CultivationTechnique.create.mockResolvedValue(mockTechnique);

      const result = await adminService.createCultivationService(cultivationData);

      expect(db.CultivationTechnique.findOne).toHaveBeenCalledWith({
        where: { name: cultivationData.name }
      });
      expect(db.CultivationTechnique.create).toHaveBeenCalled();
      expect(mockTechnique.setCafeVarieties).toHaveBeenCalledWith([1, 2]);
      expect(result.errCode).toBe(0);
    });

    it('TC-CULT-002: should return error when technique name already exists', async () => {
      const cultivationData = {
        name: 'Shade Growing',
        description: 'Test'
      };
      const existingTechnique = { id: 1, name: 'Shade Growing' };

      db.CultivationTechnique.findOne.mockResolvedValue(existingTechnique);

      const result = await adminService.createCultivationService(cultivationData);

      expect(result.errCode).toBe(1);
    });

    it('TC-CULT-003: should create technique without cafe variety associations', async () => {
      const cultivationData = {
        name: 'Full Sun Growing',
        description: 'Growing coffee in full sun'
      };
      const mockTechnique = { id: 2, name: cultivationData.name, setCafeVarieties: jest.fn() };

      db.CultivationTechnique.findOne.mockResolvedValue(null);
      db.CultivationTechnique.create.mockResolvedValue(mockTechnique);

      await adminService.createCultivationService(cultivationData);

      expect(mockTechnique.setCafeVarieties).not.toHaveBeenCalled();
    });

    it('TC-CULT-004: should handle database error', async () => {
      const cultivationData = {
        name: 'Intercropping',
        description: 'Growing with other crops'
      };

      db.CultivationTechnique.findOne.mockRejectedValue(new Error('DB error'));

      const result = await adminService.createCultivationService(cultivationData);

      expect(result.errCode).toBe(-1);
    });
  });

  // ============= GET ALL CULTIVATION TESTS (2 tests) =============
  describe('getAllCultivationService', () => {
    it('TC-CULT-005: should fetch all cultivation techniques successfully', async () => {
      const mockTechniques = [
        { id: 1, name: 'Shade Growing', description: 'Shade growing method' },
        { id: 2, name: 'Full Sun', description: 'Full sun method' }
      ];

      db.CultivationTechnique.findAll.mockResolvedValue(mockTechniques);

      const result = await adminService.getAllCultivationService();

      expect(db.CultivationTechnique.findAll).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
      expect(result.data).toHaveLength(2);
    });

    it('TC-CULT-006: should return empty array when no techniques exist', async () => {
      db.CultivationTechnique.findAll.mockResolvedValue([]);

      const result = await adminService.getAllCultivationService();

      expect(result.errCode).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  // ============= GET CULTIVATION BY ID TESTS (2 tests) =============
  describe('getCultivationByIdService', () => {
    it('TC-CULT-007: should fetch cultivation technique by id successfully', async () => {
      const techniqeId = 1;
      const mockTechnique = { id: 1, name: 'Shade Growing', description: 'Shade method' };

      db.CultivationTechnique.findByPk.mockResolvedValue(mockTechnique);

      const result = await adminService.getCultivationByIdService(techniqeId);

      expect(db.CultivationTechnique.findByPk).toHaveBeenCalledWith(techniqeId);
      expect(result.errCode).toBe(0);
      expect(result.data).toEqual(mockTechnique);
    });

    it('TC-CULT-008: should return error when technique not found', async () => {
      const techniqeId = 999;

      db.CultivationTechnique.findByPk.mockResolvedValue(null);

      const result = await adminService.getCultivationByIdService(techniqeId);

      expect(result.errCode).toBe(1);
    });
  });

  // ============= UPDATE CULTIVATION TESTS (4 tests) =============
  describe('updateCultivationService', () => {
    it('TC-CULT-009: should update cultivation technique successfully', async () => {
      const techniqueId = 1;
      const updateData = {
        name: 'Advanced Shade Growing',
        description: 'Updated description',
        cafeVarietyIds: [1, 2, 3]
      };
      const mockTechnique = {
        id: 1,
        name: 'Shade Growing',
        save: jest.fn().mockResolvedValue(true),
        setCafeVarieties: jest.fn()
      };

      db.CultivationTechnique.findByPk.mockResolvedValue(mockTechnique);

      const result = await adminService.updateCultivationService(techniqueId, updateData);

      expect(mockTechnique.save).toHaveBeenCalled();
      expect(mockTechnique.setCafeVarieties).toHaveBeenCalledWith([1, 2, 3]);
      expect(result.errCode).toBe(0);
    });

    it('TC-CULT-010: should return error when technique not found', async () => {
      const techniqueId = 999;
      const updateData = { name: 'Test' };

      db.CultivationTechnique.findByPk.mockResolvedValue(null);

      const result = await adminService.updateCultivationService(techniqueId, updateData);

      expect(result.errCode).toBe(1);
    });

    it('TC-CULT-011: should update technique without changing cafe varieties', async () => {
      const techniqueId = 1;
      const updateData = {
        name: 'Updated Shade Growing',
        description: 'Updated description'
      };
      const mockTechnique = {
        id: 1,
        save: jest.fn().mockResolvedValue(true),
        setCafeVarieties: jest.fn()
      };

      db.CultivationTechnique.findByPk.mockResolvedValue(mockTechnique);

      await adminService.updateCultivationService(techniqueId, updateData);

      expect(mockTechnique.setCafeVarieties).not.toHaveBeenCalled();
    });

    it('TC-CULT-012: should handle database error', async () => {
      const techniqueId = 1;
      const updateData = { name: 'Updated' };

      db.CultivationTechnique.findByPk.mockRejectedValue(new Error('DB error'));

      const result = await adminService.updateCultivationService(techniqueId, updateData);

      expect(result.errCode).toBe(-1);
    });
  });

  // ============= DELETE CULTIVATION TESTS (3 tests) =============
  describe('deleteCultivationService', () => {
    it('TC-CULT-013: should delete cultivation technique successfully', async () => {
      const techniqueId = 1;
      const mockTechnique = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      db.CultivationTechnique.findByPk.mockResolvedValue(mockTechnique);

      const result = await adminService.deleteCultivationService(techniqueId);

      expect(mockTechnique.destroy).toHaveBeenCalled();
      expect(result.errCode).toBe(0);
    });

    it('TC-CULT-014: should return error when technique not found', async () => {
      const techniqueId = 999;

      db.CultivationTechnique.findByPk.mockResolvedValue(null);

      const result = await adminService.deleteCultivationService(techniqueId);

      expect(result.errCode).toBe(1);
    });

    it('TC-CULT-015: should handle deletion error', async () => {
      const techniqueId = 1;
      const mockTechnique = {
        id: 1,
        destroy: jest.fn().mockRejectedValue(new Error('Delete failed'))
      };

      db.CultivationTechnique.findByPk.mockResolvedValue(mockTechnique);

      const result = await adminService.deleteCultivationService(techniqueId);

      expect(result.errCode).toBe(-1);
    });
  });
});
