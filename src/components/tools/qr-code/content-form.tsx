'use client';

import { useId } from 'react';
import { WIFI_SECURITY, type ContentType, type QrFields } from '@/lib/tools/qr/content';
import { Toggle } from '@/components/tools/workbench/options-popover';
import { TextField } from '@/components/tools/crypto/parts';
import { Note, SelectRow } from '@/components/tools/time/parts';
import { useToolMessages } from '@/i18n/tools/provider';

/** Multi-line counterpart of `TextField`, with the label above. */
function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-fg-subtle">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        dir="auto"
        className="block w-full min-w-0 resize-y rounded-md border border-line bg-surface-2 px-2 py-1.5 text-xs leading-snug text-fg outline-none placeholder:text-fg-subtle focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

const VCARD_FIELDS = [
  'firstName',
  'lastName',
  'org',
  'title',
  'phone',
  'email',
  'url',
  'address',
] as const satisfies (keyof QrFields['vcard'])[];

/** The inputs for one content type. */
export function ContentForm({
  type,
  fields,
  onChange,
}: {
  type: ContentType;
  fields: QrFields;
  onChange: (fields: QrFields) => void;
}) {
  const t = useToolMessages<'qr-code'>();

  if (type === 'text') {
    return (
      <TextAreaField
        label={t.text}
        value={fields.text}
        onChange={(text) => onChange({ ...fields, text })}
        placeholder={t.textPlaceholder}
        rows={6}
      />
    );
  }

  if (type === 'url') {
    return (
      <TextField
        label={t.url}
        value={fields.url}
        onChange={(url) => onChange({ ...fields, url })}
        placeholder={t.urlPlaceholder}
      />
    );
  }

  if (type === 'wifi') {
    const wifi = fields.wifi;
    const set = (patch: Partial<QrFields['wifi']>) =>
      onChange({ ...fields, wifi: { ...wifi, ...patch } });
    return (
      <div className="space-y-3">
        <TextField label={t.ssid} value={wifi.ssid} onChange={(ssid) => set({ ssid })} />
        <SelectRow
          label={t.security}
          value={wifi.security}
          onChange={(security) => set({ security })}
          options={WIFI_SECURITY.map((value) => ({ value, label: t.securityOptions[value] }))}
        />
        {wifi.security !== 'nopass' && (
          <div className="space-y-1">
            <TextField
              label={t.password}
              value={wifi.password}
              onChange={(password) => set({ password })}
            />
            <Note>{t.passwordNotSaved}</Note>
          </div>
        )}
        <Toggle
          label={t.hidden}
          hint={t.hiddenHint}
          checked={wifi.hidden}
          onChange={(hidden) => set({ hidden })}
        />
      </div>
    );
  }

  if (type === 'vcard') {
    const vcard = fields.vcard;
    return (
      <div className="space-y-3">
        {VCARD_FIELDS.map((key) => (
          <TextField
            key={key}
            label={t.vcard[key]}
            value={vcard[key]}
            onChange={(value) => onChange({ ...fields, vcard: { ...vcard, [key]: value } })}
          />
        ))}
        <TextAreaField
          label={t.vcard.note}
          value={vcard.note}
          onChange={(note) => onChange({ ...fields, vcard: { ...vcard, note } })}
          rows={3}
        />
      </div>
    );
  }

  const email = fields.email;
  const set = (patch: Partial<QrFields['email']>) =>
    onChange({ ...fields, email: { ...email, ...patch } });
  return (
    <div className="space-y-3">
      <TextField
        label={t.emailTo}
        value={email.to}
        onChange={(to) => set({ to })}
        placeholder={t.emailToPlaceholder}
      />
      <TextField label={t.subject} value={email.subject} onChange={(subject) => set({ subject })} />
      <TextAreaField label={t.body} value={email.body} onChange={(body) => set({ body })} />
    </div>
  );
}
