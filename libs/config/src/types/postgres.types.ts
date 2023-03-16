export interface PostgresInterface {
  readonly postgres: PostgresConfigInterface;
}

export interface PostgresConfigInterface {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly database: string;
  readonly ssl?: {
    ca: string;
    key: string;
    cert: string;
  };
}
