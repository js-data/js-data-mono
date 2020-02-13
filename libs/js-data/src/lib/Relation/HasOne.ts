import utils from '../utils';
import { Relation } from '../Relation';

export class HasOneRelation extends Relation {

  static TYPE_NAME = 'hasOne';

  findExistingLinksFor(relatedMapper, record) {
    const recordId = utils.get(record, relatedMapper.idAttribute);
    const records = this.findExistingLinksByForeignKey(recordId);

    if (records?.length) {
      return records[0];
    }
  }

  isRequiresChildId() {
    return true;
  }
}
