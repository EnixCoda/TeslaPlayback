/// <reference lib="react" />

type Option<T> = { id: string; value: T };

type IO<T> = {
  value: T;
  onChange: (value: T) => void;
};

type NonConflictJoin<Target, Source> = Target & Omit<Source, keyof Target>;

type ReactSet<T> = React.Dispatch<React.SetStateAction<T>>;

type ReactStateIO<T> = { get: T; set: ReactSet<T> };

type ValueOf<T> = T[keyof T];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ValueOfArray<T extends any[] | readonly any[]> = T[number];

// Default `Object.entries` does not handle `Record` type as expected
interface ObjectConstructor {
  entries<Key extends string, T>(o: Record<Key, T>): [Key, T][];
}
