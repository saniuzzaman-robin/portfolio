import React from 'react';

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

interface JSONObject {
  [key: string]: JSONValue;
}

type JSONArray = JSONValue[];

export function highlightJSON(data: JSONValue | Record<string, unknown>): React.ReactNode {
  const json = JSON.stringify(data, null, 2);
  return renderJSON(json);
}

function renderJSON(json: string): React.ReactNode {
  const lines = json.split('\n');

  return (
    <div className="space-y-0">
      {lines.map((line, idx) => (
        <div key={idx} className="flex">
          <span className="text-midnight-500/40 mr-3 w-8 text-right select-none">{idx + 1}</span>
          <span className="flex-1 whitespace-pre-wrap">{highlightLine(line)}</span>
        </div>
      ))}
    </div>
  );
}

function highlightLine(line: string): React.ReactNode {
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < line.length) {
    // Handle whitespace
    if (/\s/.test(line[i])) {
      const start = i;
      while (i < line.length && /\s/.test(line[i])) {
        i++;
      }
      elements.push(
        <span key={`ws-${i}`} className="text-midnight-500">
          {line.slice(start, i)}
        </span>
      );
      continue;
    }

    // Handle keys (quoted strings followed by colon)
    if (line[i] === '"') {
      const start = i;
      i++;
      while (i < line.length && line[i] !== '"') {
        if (line[i] === '\\') i++;
        i++;
      }
      if (i < line.length) i++; // closing quote

      const key = line.slice(start, i);

      // Check if this is a key (followed by colon)
      let j = i;
      while (j < line.length && /\s/.test(line[j])) j++;

      if (j < line.length && line[j] === ':') {
        elements.push(
          <span key={`key-${i}`} className="text-cyan-300">
            {key}
          </span>
        );
        continue;
      } else {
        // This is a string value
        elements.push(
          <span key={`str-${i}`} className="text-emerald-300">
            {key}
          </span>
        );
        continue;
      }
    }

    // Handle numbers
    if (/[\d-]/.test(line[i])) {
      const start = i;
      if (line[i] === '-') i++;
      while (i < line.length && /[\d.eE+]/.test(line[i])) {
        i++;
      }
      elements.push(
        <span key={`num-${i}`} className="text-amber-300">
          {line.slice(start, i)}
        </span>
      );
      continue;
    }

    // Handle booleans and null
    if (line.slice(i, i + 4) === 'true' || line.slice(i, i + 5) === 'false') {
      const len = line.slice(i, i + 4) === 'true' ? 4 : 5;
      elements.push(
        <span key={`bool-${i}`} className="text-purple-300">
          {line.slice(i, i + len)}
        </span>
      );
      i += len;
      continue;
    }

    if (line.slice(i, i + 4) === 'null') {
      elements.push(
        <span key={`null-${i}`} className="text-purple-300">
          null
        </span>
      );
      i += 4;
      continue;
    }

    // Handle brackets and colons
    if (/[{}[\]:,]/.test(line[i])) {
      const char = line[i];
      elements.push(
        <span key={`bracket-${i}`} className="text-gray-300">
          {char}
        </span>
      );
      i++;
      continue;
    }

    // Default: just add the character
    elements.push(
      <span key={`char-${i}`} className="text-midnight-400">
        {line[i]}
      </span>
    );
    i++;
  }

  return elements;
}
