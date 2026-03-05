import { useState } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { ParchmentCard } from '../ui/ParchmentCard';
import complicationsData from '../../data/complications.json';

interface Complication {
  name: string;
  benefit: string;
  drawback: string;
}

const complications: Complication[] = complicationsData.complications;

export function ComplicationStep() {
  const complicationName = useCharacterStore((s) => s.character.complicationName);
  const setComplication = useCharacterStore((s) => s.setComplication);

  const [useComplication, setUseComplication] = useState(complicationName !== null);

  function handleToggle() {
    const next = !useComplication;
    setUseComplication(next);
    if (!next) {
      setComplication(null);
    }
  }

  function handleSelect(name: string) {
    setComplication(name === complicationName ? null : name);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">Complication</h2>
        <p className="font-body text-cream-dark/60 mt-2">
          Complications add narrative depth with both benefits and drawbacks.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className="font-heading text-sm text-gold/80 tracking-wide">
          Use a Complication?
        </span>
        <button
          type="button"
          onClick={handleToggle}
          className={[
            'relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer border',
            useComplication
              ? 'bg-gold-dark border-gold shadow-[0_0_8px_rgba(201,168,76,0.3)]'
              : 'bg-ink/60 border-gold-dark/40',
          ].join(' ')}
        >
          <div
            className={[
              'absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300',
              useComplication
                ? 'left-7 bg-gold-light shadow-lg'
                : 'left-0.5 bg-gold-dark/60',
            ].join(' ')}
          />
        </button>
      </div>

      {!useComplication ? (
        <div className="text-center py-12">
          <p className="font-body text-lg text-cream-dark/40 italic">
            Complications are optional. You can proceed without one.
          </p>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto pr-2 flex flex-col gap-4">
          {complications.map((comp) => (
            <ParchmentCard
              key={comp.name}
              selected={complicationName === comp.name}
              hoverable
              compact
              onClick={() => handleSelect(comp.name)}
            >
              <h3 className="font-heading text-lg font-bold text-gold-light mb-3">
                {comp.name}
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-heading text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Benefit
                    </span>
                    <p className="font-body text-sm text-cream-dark/70 leading-relaxed mt-0.5">
                      {comp.benefit}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-red-400" />
                  <div>
                    <span className="font-heading text-xs font-semibold uppercase tracking-wider text-red-400">
                      Drawback
                    </span>
                    <p className="font-body text-sm text-cream-dark/70 leading-relaxed mt-0.5">
                      {comp.drawback}
                    </p>
                  </div>
                </div>
              </div>
            </ParchmentCard>
          ))}
        </div>
      )}
    </div>
  );
}
