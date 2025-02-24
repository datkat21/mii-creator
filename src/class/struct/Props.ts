export enum PropType {
  Number,
  String,
  Array
}

export type Prop = NumberProp | StringProp | ArrayProp;
export type PropTable = Record<string, Prop>;

export type NumberProp = {
  type: PropType.Number;
  name?: string;
  default?: number;
  min: number;
  max: number;
  condition?: (value: number) => any;
};
export type StringProp = {
  type: PropType.String;
  name?: string;
  default?: string;
  min: number;
  max: number;
  condition?: (value: string) => any;
};
export type ArrayProp = {
  type: PropType.Array;
  name?: string;
  default?: number[];
  size: number;
  min: number;
  max: number;
  condition?: (value: any[]) => any;
};
