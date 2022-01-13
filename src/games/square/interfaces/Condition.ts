import Items from '../enums/Items';
import Triggers from '../enums/Triggers';

export interface Condition {
  id?: number
  condition: Triggers;
  action: Items;
}
