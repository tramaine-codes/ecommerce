import { nanoid } from 'nanoid';

export class IdGenerator {
  private generate = () => nanoid();

  static generate = () => new IdGenerator().generate();
}
