import { TLiteral } from "@sinclair/typebox";
import { t } from "elysia";

export function getTime() {
  return Math.floor(Date.now() / 1000);
}

export function isValidId(id: number) {
  return id % 1 === 0 && id < 2147483647;
}

// https://github.com/sinclairzx81/typebox/issues/1135
export type TStringsToLiterals<
  Strings extends string[],
  Result extends TLiteral[] = [],
> = Strings extends [infer Left extends string, ...infer Right extends string[]]
  ? TStringsToLiterals<Right, [...Result, TLiteral<Left>]>
  : Result;

export function StringsToLiterals<Strings extends string[]>(
  strings: readonly [...Strings],
): TStringsToLiterals<Strings> {
  return strings.map((item) => t.Literal(item)) as never;
}
