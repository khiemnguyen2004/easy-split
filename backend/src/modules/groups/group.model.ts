export interface GroupModel {
  id: string;
  name: string;
  description?: string;
  budgetAmount?: number;
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
}
