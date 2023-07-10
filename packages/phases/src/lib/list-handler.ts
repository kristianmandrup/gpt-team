export class ListHandler {
  protected ordering: any[] = [];
  protected ignored: any[] = [];
  protected groups: any = {};

  constructor(config: any) {
    this.ordering = config['order'];
    this.ignored = config['ignore'];
    this.groups = config['groups'];
  }

  prepare(obj: any) {
    return this.ordered(this.ignore(this.addNameTo(obj)));
  }

  prepareList(list: any[]) {
    return this.ordered(this.ignore(list));
  }

  addNameTo(obj: any) {
    return Object.keys(obj).reduce((acc: any[], key: string) => {
      const item = obj[key];
      item.name = key;
      acc.push(item);
      return acc;
    }, []);
  }

  indexOf(name: string): number {
    return this.ordering.indexOf(name);
  }

  ignore(list: any[]) {
    const { ignored } = this;
    if (!ignored || ignored.length == 0) return list;
    return list.filter((item) => this.ignored.includes(item.name));
  }

  findMatchingGroup(item: string) {
    for (const key in this.groups) {
      const group = this.groups[key];
      if (group.find((elem: string) => elem === item)) {
        return group;
      }
    }
  }

  group(list: any[]) {
    return list.reduce((acc, item) => {
      const group = this.findMatchingGroup(item);
      acc[group] = acc[group] || [];
      acc[group].push(item);
      return acc;
    }, {});
  }

  invertedGroup(group: any) {
    return Object.keys(group).reduce((acc: any, key: string) => {
      const list = group[key];
      for (const item of list) {
        acc[item] = key;
      }
      return acc;
    }, {});
  }

  ordered(list: any[]) {
    const { ordering } = this;
    if (!ordering || ordering.length == 0) return list;
    return list.sort((i1: any, i2: any) => {
      return this.indexOf(i1.name) <= this.indexOf(i2.name) ? 1 : 0;
    });
  }
}
