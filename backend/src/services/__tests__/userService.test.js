const userService = require('../userService');
const bcrypt = require('bcryptjs');
const db = require('../../models/index');

// Mock the database and bcrypt
jest.mock('../../models/index');
jest.mock('bcryptjs', () => ({
  genSaltSync: jest.fn(() => 10),
  hashSync: jest.fn(),
  compare: jest.fn(),
}));

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerService', () => {
    it('should register a new user successfully', async () => {
      const data = { email: 'test@example.com', password: 'password', username: 'testuser' };
      db.User.findOne.mockResolvedValue(null);
      bcrypt.hashSync.mockReturnValue('hashedpassword');
      db.User.create.mockResolvedValue({});

      const result = await userService.registerService(data);

      expect(db.User.findOne).toHaveBeenCalledWith({ where: { email: data.email } });
      expect(bcrypt.hashSync).toHaveBeenCalledWith(data.password, expect.any(Number));
      expect(db.User.create).toHaveBeenCalledWith({
        email: data.email,
        password: 'hashedpassword',
        userName: data.username,
        role: 'user',
      });
      expect(result).toEqual({
        errCode: 0,
        errMessage: 'Register success',
      });
    });

    it('should return error if email already exists', async () => {
      const data = { email: 'existing@example.com', password: 'password', username: 'testuser' };
      db.User.findOne.mockResolvedValue({ id: 1, email: data.email });

      const result = await userService.registerService(data);

      expect(result).toEqual({
        errCode: 1,
        errMessage: 'Email exists, please try another email!',
      });
    });
  });

  describe('loginService', () => {
    it('should login successfully with correct credentials', async () => {
      const data = { email: 'test@example.com', password: 'password' };
      const mockUser = { id: 1, email: data.email, password: 'hashedpassword', userName: 'testuser', role: 'user' };
      db.User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.loginService(data);

      expect(db.User.findOne).toHaveBeenCalledWith({
        attributes: ['id', 'email', 'password', 'userName', 'role'],
        where: { email: data.email },
        raw: true,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(data.password, mockUser.password);
      expect(result.errCode).toBe(0);
      expect(result.errMessage).toBe('Login success');
      expect(result.token).toBeDefined();
    });

    it('should return error if email does not exist', async () => {
      const data = { email: 'nonexistent@example.com', password: 'password' };
      db.User.findOne.mockResolvedValue(null);

      const result = await userService.loginService(data);

      expect(result).toEqual({
        errCode: 1,
        errMessage: 'Your email is not exist in our system. Please try another email',
      });
    });

    it('should return error if password is wrong', async () => {
      const data = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = { id: 1, email: data.email, password: 'hashedpassword', userName: 'testuser', role: 'user' };
      db.User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const result = await userService.loginService(data);

      expect(result).toEqual({
        errCode: 1,
        errMessage: 'Password wrong!',
      });
    });
  });
});