import { SchemaBlockEditor } from "./editors/SchemaBlockEditor";

type Props = {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

export function BlockEditorRouter({ value, onChange }: Props) {
  return <SchemaBlockEditor value={value} onChange={onChange} />;
}
