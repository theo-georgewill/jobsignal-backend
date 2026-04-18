import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

interface User {
  id: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {

  private users: User[] = [];

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now().toString(), 
      email, 
      password: hashedPassword 
    };

    this.users.push(user);

    return user;
  }

  async login(email: string, password: string){
    const user = this.users.find(user => user.email === email);

    if (!user) throw new Error("User not found");

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) throw new Error("Invalid password");

    return {
      access_token: "fake-jwt-for-now",
    };
  }
}
