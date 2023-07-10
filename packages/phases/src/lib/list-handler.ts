export class ListHandler {
    protected ordering: any[] = []
    protected ignored: any[] = []

    constructor(config: any) {
        this.ordering = config['order'];
        this.ignored = config['ignore'];  
    }

    prepare(obj: any) {
      return this.ordered(this.ignore(this.addNameTo(obj)))
    }

    addNameTo(obj: any) {
        return Object.keys(obj).reduce((acc: any[], key: string) => {
            const phase = obj[key]
            obj.name = key
            acc.push(obj)
            return acc
          }, [])        
    }

    indexOf(name: string): number {
        return this.ordering.indexOf(name);
    }

    ignore(list: any[]) {
        if (this.ignored.length == 0) return list;
        return list.filter((item) => this.ignored.includes(item.name));
    }
    
    ordered(list: any[]) {
      if (this.ordering.length == 0) return list;
      return list.sort((i1: any, i2: any) => {
        return this.indexOf(i1.name) <= this.indexOf(i2.name) ? 1 : 0;
      });
    }    
}