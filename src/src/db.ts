import Dexie from "dexie";
import type { Table } from "dexie";

export interface DBFile {
  id: string;
  name: string;
  type: string;
  content: string;
  subjectName: string;
  date: string;
  isFavorite?: boolean;
}

export interface DBSubject {
  name: string;
  color: string;
}

export interface DBActivity {
  id: string;
  text: string;
  time: string;
}

class StudyVaultDB extends Dexie {
  files!: Table<DBFile>;
  subjects!: Table<DBSubject>;
  activities!: Table<DBActivity>;

  constructor() {
    super("StudyVaultDB");

    this.version(1).stores({
      files: "id, subjectName, isFavorite",
      subjects: "name",
      activities: "id"
    });
  }
}

export const db = new StudyVaultDB();
