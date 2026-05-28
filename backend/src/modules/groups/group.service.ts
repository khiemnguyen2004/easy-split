import { GroupRepository } from './group.repository';
import { GroupModel } from './group.model';

export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async createGroup(name: string, createdBy: string, description?: string, budgetAmount?: number): Promise<GroupModel> {
    // Business logic, e.g., generating invite code
    const inviteCode = this.generateInviteCode();

    const newGroup = await this.groupRepository.create({
      name,
      createdBy,
      description,
      budgetAmount,
      inviteCode,
      createdAt: new Date(),
    });

    // You could also call UserRepository to assign admin role here
    return newGroup;
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
