const adminService = require('../adminService');
const bcrypt = require('bcryptjs');
const db = require('../../models/index');

// Mock the database and bcrypt
jest.mock('../../models/index');
jest.mock('bcryptjs', () => ({
  genSaltSync: jest.fn(() => 10),
  hashSync: jest.fn(),
}));

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserService', () => {
    it('should create a new user successfully', async () => {
      const userData = { email: 'newuser@example.com', password: 'password', username: 'newuser', role: 'user', image: 'image.jpg' };
      const hashedPassword = 'hashedpassword';
      const newUser = { id: 1, ...userData, password: hashedPassword };

      db.User.findOne.mockResolvedValue(null);
      bcrypt.hashSync.mockReturnValue(hashedPassword);
      db.User.create.mockResolvedValue(newUser);

      const result = await adminService.createUserService(userData);

      expect(db.User.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(bcrypt.hashSync).toHaveBeenCalledWith(userData.password, expect.any(Number));
      expect(db.User.create).toHaveBeenCalledWith({
        email: userData.email,
        password: hashedPassword,
        userName: userData.username,
        role: userData.role,
        image: userData.image,
      });
      expect(result).toEqual({
        errCode: 0,
        errMessage: 'User created successfully',
        data: newUser,
      });
    });

    it('should return error if email already exists', async () => {
      const userData = { email: 'existing@example.com', password: 'password', username: 'user', role: 'user' };
      db.User.findOne.mockResolvedValue({ id: 1, email: userData.email });

      const result = await adminService.createUserService(userData);

      expect(result).toEqual({
        errCode: 1,
        errMessage: 'Email already exists',
      });
    });
  });

  describe('updateUserService', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const userData = { username: 'updateduser', role: 'admin', image: 'newimage.jpg' };
      const existingUser = { id: userId, userName: 'olduser', role: 'user', image: 'oldimage.jpg', save: jest.fn() };
      const updatedUser = { ...existingUser, ...userData };

      db.User.findOne.mockResolvedValue(existingUser);
      existingUser.save.mockResolvedValue(updatedUser);

      const result = await adminService.updateUserService(userId, userData);

      expect(db.User.findOne).toHaveBeenCalledWith({ where: { id: userId }, raw: false });
      expect(existingUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        errCode: 0,
        errMessage: 'User updated successfully',
        data: { ...existingUser, userName: userData.username, role: userData.role, image: userData.image },
      });
    });

    it('should return error if user not found', async () => {
      const userId = 999;
      const userData = { username: 'user', role: 'user' };

      db.User.findOne.mockResolvedValue(null);

      const result = await adminService.updateUserService(userId, userData);

      expect(result).toEqual({
        errCode: 1,
        errMessage: 'User not found',
      });
    });
  });
});