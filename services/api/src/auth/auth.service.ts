import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(email: string, password: string) {
    // TODO: Implement authentication logic
    return { message: 'Login endpoint not yet implemented' };
  }

  async register(data: { email: string; password: string; name: string }) {
    // TODO: Implement registration logic
    return { message: 'Register endpoint not yet implemented' };
  }
}
