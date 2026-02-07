/**
 * Authentication Library
 * JWT-based auth for organizers with bcrypt password hashing
 */

import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getUserByEmail, getUserById, createUser, updateUser } from './knack';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');
const TOKEN_NAME = 'fiddyfiddy_auth';
const TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param {string} plainPassword - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Stored hash
 * @returns {Promise<boolean>} True if match
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Create a JWT token for a user
 * @param {object} user - User object
 * @returns {Promise<string>} JWT token
 */
export async function createToken(user) {
  const token = await new jose.SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
  
  return token;
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Promise<object|null>} Decoded payload or null
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Set auth cookie
 * @param {string} token - JWT token
 */
export function setAuthCookie(token) {
  cookies().set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get auth cookie
 * @returns {string|null} Token or null
 */
export function getAuthCookie() {
  const cookie = cookies().get(TOKEN_NAME);
  return cookie?.value || null;
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie() {
  cookies().delete(TOKEN_NAME);
}

/**
 * Get current authenticated user
 * @returns {Promise<object|null>} User object or null
 */
export async function getCurrentUser() {
  const token = getAuthCookie();
  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  try {
    const user = await getUserById(payload.userId);
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate user with email/password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} { success, user, token, error }
 */
export async function authenticateUser(email, password) {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Verify password using bcrypt
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Only block Suspended users - Pending users CAN log in
    if (user.status === 'Suspended') {
      return { success: false, error: 'Account is suspended' };
    }
    
    const token = await createToken(user);
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        venmo_handle: user.venmo_handle,
        status: user.status,
      },
      token,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Register a new user (for future use)
 * @param {object} userData - User data including plain password
 * @returns {Promise<object>} { success, user, error }
 */
export async function registerUser(userData) {
  try {
    // Check if user already exists
    const existing = await getUserByEmail(userData.email);
    if (existing) {
      return { success: false, error: 'Email already registered' };
    }
    
    // Hash password before storing
    const hashedPassword = await hashPassword(userData.password);
    
    const user = await createUser({
      ...userData,
      password: hashedPassword,
      status: 'Active',
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Require authentication middleware helper
 * @param {Request} request - Request object
 * @returns {Promise<object>} { authenticated, user, error }
 */
export async function requireAuth(request) {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  
  if (!token) {
    return { authenticated: false, error: 'Not authenticated' };
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    return { authenticated: false, error: 'Invalid token' };
  }
  
  try {
    const user = await getUserById(payload.userId);
    if (!user) {
      return { authenticated: false, error: 'User not found' };
    }
    
    // Only block Suspended users - Pending users CAN authenticate
    if (user.status === 'Suspended') {
      return { authenticated: false, error: 'Account is suspended' };
    }
    
    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

/**
 * Check if user has required role
 * @param {object} user - User object
 * @param {string|array} allowedRoles - Allowed role(s)
 * @returns {boolean} True if user has required role
 */
export function hasRole(user, allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}
