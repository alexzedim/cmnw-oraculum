export interface RabbitInterface {
  readonly rabbit: RabbitConfigInterface;
}

export interface RabbitConfigInterface {
  readonly user: string;
  readonly password: string;
  readonly host: string;
  readonly port: number | string;
  readonly uri: string;
}
