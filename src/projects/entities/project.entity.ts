export interface ProjectEntity {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMemberEntity {
  userId: string;
  projectId: string;
  role: 'OWNER' | 'MEMBER';
}
