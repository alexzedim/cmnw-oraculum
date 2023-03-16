export interface RedisInterface {
  readonly redis: RedisConfigInterface;
}

export interface RedisConfigInterface {
  readonly host: string;
  readonly port: number;
  readonly password: string;
}
