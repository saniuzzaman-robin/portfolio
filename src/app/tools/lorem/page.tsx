'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import {
  ToolShell,
  ToolPanel,
  ToolTextarea,
  CopyButton,
  ToolTabs,
  ToolActionButton,
} from '@/components/tools/tool-shell';
import { FileText } from 'lucide-react';

const LOREM_IPSUM = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  'Totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
  'Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
];

const BACON = [
  'Bacon ipsum dolor amet strip steak pork belly ribeye, burgdoggen corned beef brisket short loin.',
  'Pork chop kielbasa shankle, pork loin short ribs alcatra beef ribs jerky meatball tail.',
  'Filet mignon turducken hamburger porchetta shank, cupim andouille ham hock.',
  'Pancetta frankfurter swine, t-bone ham hock shoulder salami tongue bresaola short loin.',
];

const HIPSTER = [
  'Thundercats narwhal poke, austin tacos DIY vegan brunch tumeric kickstarter.',
  'Kombucha gochujang franzen, four dollar toast selvage cardigan Brooklyn polaroid.',
  'Farm-to-table shabby chic letterpress, pabst chambray blog waistcoat taxidermy.',
  'Artisan viral ethical, copper mug seitan swag fixie intelligentsia scenester.',
];

const CORPORATE = [
  'Synergize cross-functional deliverables to streamline bleeding-edge paradigms.',
  'Leverage agile frameworks to provide robust synopsis for high-level overviews.',
  'Iteratively revolutionize world-class intellectual capital via next-generation solutions.',
  'Collaboratively administrate empowered markets via plug-and-play networks.',
];

export default function LoremPage() {
  const [type, setType] = useState<'lorem' | 'bacon' | 'hipster' | 'corporate'>('lorem');
  const [unit, setUnit] = useState<'paragraphs' | 'words' | 'sentences'>('paragraphs');
  const [count, setCount] = useState(3);
  const [htmlWrap, setHtmlWrap] = useState(false);
  const [output, setOutput] = useState('');

  const sources = {
    lorem: LOREM_IPSUM,
    bacon: BACON,
    hipster: HIPSTER,
    corporate: CORPORATE,
  };

  const generate = () => {
    const source = sources[type];
    let result = '';

    if (unit === 'paragraphs') {
      const paragraphs: string[] = [];
      for (let i = 0; i < count; i++) {
        paragraphs.push(source[i % source.length]);
      }
      result = htmlWrap
        ? paragraphs.map((p) => `<p>${p}</p>`).join('\n\n')
        : paragraphs.join('\n\n');
    } else if (unit === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        sentences.push(source[i % source.length]);
      }
      result = sentences.join(' ');
    } else {
      // words
      const allWords = source.join(' ').split(/\s+/);
      const words = [];
      for (let i = 0; i < count; i++) {
        words.push(allWords[i % allWords.length]);
      }
      result = words.join(' ');
    }

    setOutput(result);
  };

  return (
    <>
      <Navigation />
      <ToolShell
        title="Lorem Ipsum"
        subtitle="Placeholder Text Generator"
        description="Generate placeholder text in various styles. Perfect for mockups, designs, and testing layouts."
        icon={FileText}
        accent="secondary"
      >
        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Type selector */}
          <div>
            <label className="text-midnight-500 mb-2 block text-sm font-medium">Text Style</label>
            <ToolTabs
              tabs={['lorem', 'bacon', 'hipster', 'corporate']}
              active={type}
              onChange={(t) => setType(t as typeof type)}
              accent="secondary"
            />
          </div>

          {/* Unit and count */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-midnight-500 mb-2 block text-sm font-medium">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as typeof unit)}
                className="bg-midnight-100 border-midnight-200 text-midnight-950 focus:border-secondary-50/50 w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
              >
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>

            <div>
              <label className="text-midnight-500 mb-2 block text-sm font-medium">Count</label>
              <input
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="bg-midnight-100 border-midnight-200 text-midnight-950 focus:border-secondary-50/50 w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <ToolActionButton
                onClick={generate}
                accent="secondary"
                icon={FileText}
                label="Generate"
                fullWidth={true}
              />
            </div>
          </div>

          {/* Options */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={htmlWrap}
              onChange={(e) => setHtmlWrap(e.target.checked)}
              className="accent-secondary-50 h-4 w-4"
            />
            <span className="text-midnight-500 text-sm">
              Wrap paragraphs in <code className="text-secondary-50">&lt;p&gt;</code> tags
            </span>
          </label>
        </div>

        {/* Output */}
        {output && (
          <ToolPanel
            label="Generated Text"
            accent="secondary"
            action={<CopyButton text={output} accent="secondary" />}
          >
            <ToolTextarea value={output} readOnly rows={14} accent="secondary" />
          </ToolPanel>
        )}
      </ToolShell>
    </>
  );
}
