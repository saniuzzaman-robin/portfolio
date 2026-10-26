'use client';

import { useState } from 'react';
import { Segmented } from '@/components/tools/workbench/toolbar';
import { useRunInput, useRunInputs } from '@/components/tools/workbench/use-run';
import { useToolMessages } from '@/i18n/tools/provider';
import { algorithmInfo, keyDescription } from '@/lib/tools/jwt/algorithms';
import { SAMPLE_SECRET, SAMPLE_TOKEN } from '@/lib/tools/jwt/sample';
import { DecodeView } from './decode-view';
import { EncodeView, type GeneratedPublicKey } from './encode-view';
import type { KeyFields } from './parts';
import { useJwtMode, useSignHeader, useSignPayload } from './state';

const SAMPLE_KEYS: KeyFields = { secret: SAMPLE_SECRET, encoding: 'utf8', key: '' };

/**
 * Decoder and encoder in one page. Both modes' state lives here, so switching keeps everything
 * and each mode can hand its work to the other ("Edit and re-sign", "Verify in the decoder").
 */
export function JwtTool() {
  const t = useToolMessages<'jwt'>();
  const [mode, setMode] = useJwtMode();
  const [token, setToken] = useState(SAMPLE_TOKEN);
  const [verifyKeys, setVerifyKeys] = useState(SAMPLE_KEYS);
  const [signKeys, setSignKeys] = useState(SAMPLE_KEYS);
  const [publicKey, setPublicKey] = useState<GeneratedPublicKey | null>(null);
  const [header, setHeader] = useSignHeader();
  const [payload, setPayload] = useSignPayload();
  // Here rather than in the views, so a hand-off between modes runs right away.
  const decodeRun = useRunInput(token, '', verifyKeys);
  const signRun = useRunInputs([header, payload], '', signKeys);

  const picker = (
    <Segmented
      label={t.mode}
      value={mode}
      onChange={setMode}
      options={[
        { value: 'decode', label: t.decode },
        { value: 'encode', label: t.encode },
      ]}
    />
  );

  if (mode === 'decode') {
    return (
      <DecodeView
        picker={picker}
        token={token}
        onToken={setToken}
        keys={verifyKeys}
        onKeys={setVerifyKeys}
        runner={decodeRun}
        onEdit={(decoded) => {
          setHeader(decoded.headerText);
          setPayload(decoded.payloadText);
          signRun.run([decoded.headerText, decoded.payloadText]);
          setSignKeys({ ...signKeys, secret: verifyKeys.secret, encoding: verifyKeys.encoding });
          setMode('encode');
        }}
      />
    );
  }
  return (
    <EncodeView
      picker={picker}
      header={header}
      onHeader={setHeader}
      payload={payload}
      onPayload={setPayload}
      keys={signKeys}
      onKeys={setSignKeys}
      publicKey={publicKey}
      onPublicKey={setPublicKey}
      runner={signRun}
      onVerify={(signed, alg) => {
        setToken(signed);
        decodeRun.run(signed);
        const matching =
          publicKey && keyDescription(publicKey.alg) === keyDescription(alg) ? publicKey.pem : null;
        setVerifyKeys(
          algorithmInfo(alg).family === 'hmac'
            ? { ...verifyKeys, secret: signKeys.secret, encoding: signKeys.encoding }
            : // The private key verifies too (its public half is derived).
              { ...verifyKeys, key: matching ?? signKeys.key }
        );
        setMode('decode');
      }}
    />
  );
}
