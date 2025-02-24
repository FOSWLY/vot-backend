import { t, TSchema } from "elysia";

export function getTime() {
  return Math.floor(Date.now() / 1000);
}

export function isValidId(id: number) {
  return id % 1 === 0 && id < 2147483647;
}

export function chunks<T extends unknown[] = string[]>(a: T, size: number): T[] {
  return Array.from(Array.from({ length: Math.ceil(a.length / size) }), (_, i) =>
    a.slice(i * size, i * size + size),
  ) as T[];
}

// https://github.com/sinclairzx81/typebox/issues/1135
export type TStringsToLiterals<
  Strings extends string[],
  Result extends TSchema[] = [],
> = Strings extends [infer Left extends string, ...infer Right extends string[]]
  ? TStringsToLiterals<Right, [...Result, ReturnType<typeof t.Literal<Left>>]>
  : Result;

export function StringsToLiterals<Strings extends string[]>(
  strings: readonly [...Strings],
): TStringsToLiterals<Strings> {
  return strings.map((item) => t.Literal(item)) as never;
}
