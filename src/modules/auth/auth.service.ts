import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../user/user.repository";
import { env } from "../../config/env";

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async signup(data: any) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepo.create({
      ...data,
      password: hashedPassword,
      emailVerified: true,
      mobileVerified: true
    });

    return this.generateToken(user.id);
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return this.generateToken(user.id);
  }

  private generateToken(userId: string) {
    return jwt.sign(
      { userId },
      env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  }
}