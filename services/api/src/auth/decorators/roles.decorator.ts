import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@sundogo/types';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
