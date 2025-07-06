export class Time {
  private now = () => new Date();

  static now = () => new Time().now();
}
