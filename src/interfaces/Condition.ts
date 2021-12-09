import { Item } from './Item';
import { Trigger } from './Trigger';

export interface Condition {
  condition: Trigger;
  action: Item;
}
