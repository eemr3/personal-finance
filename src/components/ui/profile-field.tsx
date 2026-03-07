import * as Label from '@radix-ui/react-label';

type ProfileFieldProps = {
  label: string;
  value?: string | null;
};

export function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="space-y-1">
      <Label.Root className="text-sm text-muted-foreground">{label}</Label.Root>
      <p className="font-medium">{value ?? '-'}</p>
    </div>
  );
}
