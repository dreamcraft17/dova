declare module 'bcryptjs' {
  export function hashSync(value: string, rounds: number): string;
  export function compareSync(value: string, hash: string): boolean;
}
