import { UnauthorizedException } from '@nestjs/common';

interface HeadersObject {
  authorization?: string;
  Authorization?: string;
  [key: string]: string | string[] | undefined;
}

export abstract class Gateway {
  protected extractTokenFromHeaders(headers: HeadersObject): string | null {
    const authHeader = headers.authorization || headers.Authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  protected requireToken(headers: HeadersObject): string {
    const token = this.extractTokenFromHeaders(headers);
    if (!token) {
      throw new UnauthorizedException('Authorization token is required');
    }
    return token;
  }
}
