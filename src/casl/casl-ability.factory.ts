import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  AbilityClass,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';
import { Prisma } from '@prisma/client';
import { UserDto } from '../users/entities/user.entity';


export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Subjects = Prisma.ModelName | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

type PermissionAction = 'c' | 'r' | 'u' | 'd';

function getAction(letter: PermissionAction): Action {
  switch (letter) {
    case 'c': {
      return 'create';
    }
    case 'r': {
      return 'read';
    }
    case 'u': {
      return 'update';
    }
    case 'd': {
      return 'delete';
    }
    default:
      assertNever(letter);
  }
}

export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value ${value}`);
};

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserDto) {
    const {
      can: allow,
      cannot: forbid,
      build,
    } = new AbilityBuilder<MongoAbility<[Action, Subjects]>>(
      createMongoAbility as unknown as AbilityClass<AppAbility>,
    );

    const permissions = user.permission;

    // Default permissions to forbid all for all users
    forbid('manage', 'all');

    // Detect permissions from the user role
    for (const subject in permissions) {
      if (typeof permissions[subject] === 'string') {
        for (const letter of permissions[subject] as unknown as PermissionAction[]) {
          // Because currently some users have a boolean in their permissions
          allow(getAction(letter), subject as Subjects);
        }
      }
    }

    return build();
  }
}
