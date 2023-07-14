import { STATUS_ENUM } from '@cmnw/core';

export type KeyStatus = Array<STATUS_ENUM>;

export type Memorials = Array<Memorial>;

export type ClassHall = Partial<IClassHall>;

export interface IClassHall {
  emoji: string;
  tags: string[];
}

export interface Memorial {
  name: string;
  value: string;
}
