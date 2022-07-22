/// <reference lib="react" />

type ReactSet<T> = React.Dispatch<React.SetStateAction<T>>;

type ValueOf<T> = T[keyof T];
type ValueOfArray<T extends any[] | readonly any[]> = T[number];

// Default `Object.entries` does not handle `Record` type as expected
interface ObjectConstructor {
  entries<Key extends string, T>(o: Record<Key, T>): [Key, T][];
}
