export interface Item {
  id: number
  position: number[];
  taken: boolean;
  reusable: boolean;
}

export type Key = Item;

export type Sword = Item;
