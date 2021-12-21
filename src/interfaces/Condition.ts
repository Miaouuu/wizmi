import Items from '../enums/Items';
import Triggers from '../enums/Triggers';

export interface Condition {
  condition: Triggers;
  action: Items;
}
