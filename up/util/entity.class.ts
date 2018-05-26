import { Type, ts } from 'ts-simple-ast';

export class ChildEntity {
  mode: ChildEntityMode;
  upper: string;
  lower: string;
  fieldName: string;
}

export enum FieldType {
  String,
  Number,
  Boolean,
}

export class ChildField {
  fieldName: string;
  fieldType: FieldType;
}

export enum ChildMode {
  relationship,
  field,
}

export enum ChildEntityMode {
  single,
  multiple,
}

export class Entity {
  upper: string;
  lower: string;
  filename: string;
  uniqueIndex: ChildField;
  childEntities: ChildEntity[];
  childFields: ChildField[];

  constructor() {
    this.childEntities = [];
    this.childFields = [];
  }
}

export function toFieldType(t: Type<ts.Type>) {
  switch (t.getText()) {
    case 'string':
      return FieldType.String;
    case 'boolean':
      return FieldType.Boolean;
    case 'number':
      return FieldType.Boolean;
  }
  return null; //unsupported
}
