export interface Student {
  id: string;
  name: string;
  number?: string;
  notes?: string;
}

export interface DrawRecord {
  id: string;
  student: Student;
  timestamp: number;
  round: number;
}

export type DrawMode = 'without-replacement' | 'with-replacement';

export interface GroupResult {
  groupId: number;
  groupName: string;
  color: string;
  members: Student[];
}

export type GroupingStrategy = 'by-member-count' | 'by-group-count';

export type RemainderStrategy = 'distribute' | 'new-group';
