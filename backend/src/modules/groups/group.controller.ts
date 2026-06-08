import { GroupService } from './group.service';

// Mock decorators to simulate API Controller
const Controller = (route: string) => (target: any) => {};
const Post = () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {};
const Body = () => (target: any, propertyKey?: string | symbol, parameterIndex?: number) => {};
const UseGuards = (guard: any) => (target: any, propertyKey?: string) => {};

import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('/groups')
@UseGuards(AuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async createGroup(
    @Body() body: { name: string; createdBy: string; description?: string; budgetAmount?: number }
  ) {
    const group = await this.groupService.createGroup(
      body.name,
      body.createdBy,
      body.description,
      body.budgetAmount
    );

    return {
      success: true,
      data: group,
    };
  }
}
