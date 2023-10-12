export class Storage<T> {
  item: string;

  constructor(item: string) {
    this.item = item;
    localStorage.clear();
  }

  getItem() {
    const value = localStorage.getItem(this.item);
    if (!value) {
      return {} as T;
    }

    const valueObj = JSON.parse(value);

    return valueObj as T;
  }

  setItem(item: Partial<T>) {
    localStorage.setItem(this.item, JSON.stringify(item));
  }
}
