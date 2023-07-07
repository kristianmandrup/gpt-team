export class BaseAction {
    protected opts: any = {}
    public logs: any[] = []
  
    construvtor(opts: any = {}) {
      this.opts = opts
    }
}