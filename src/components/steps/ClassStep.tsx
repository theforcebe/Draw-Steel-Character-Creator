import { useCharacterStore } from '../../stores/character-store';
import type { ClassId } from '../../types/character';

interface ClassInfo {
  id: ClassId;
  name: string;
  description: string;
  resource: string;
  accent: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
}

const CLASSES: ClassInfo[] = [
  {
    id: 'censor',
    name: 'Censor',
    description: 'A divine warrior who channels holy wrath to punish the wicked',
    resource: 'Wrath',
    accent: 'amber',
    accentBorder: 'border-amber-500',
    accentBg: 'bg-amber-500/20',
    accentText: 'text-amber-400',
  },
  {
    id: 'conduit',
    name: 'Conduit',
    description: 'A divine healer who channels the power of the gods to protect allies',
    resource: 'Piety',
    accent: 'sky',
    accentBorder: 'border-sky-500',
    accentBg: 'bg-sky-500/20',
    accentText: 'text-sky-400',
  },
  {
    id: 'elementalist',
    name: 'Elementalist',
    description: 'A mage who commands the primal elements of fire, ice, and lightning',
    resource: 'Essence',
    accent: 'orange',
    accentBorder: 'border-orange-500',
    accentBg: 'bg-orange-500/20',
    accentText: 'text-orange-400',
  },
  {
    id: 'fury',
    name: 'Fury',
    description: 'An unstoppable force of primal rage who thrives in the thick of battle',
    resource: 'Rage',
    accent: 'red',
    accentBorder: 'border-red-500',
    accentBg: 'bg-red-500/20',
    accentText: 'text-red-400',
  },
  {
    id: 'null',
    name: 'Null',
    description: 'A psionic warrior who nullifies magic and controls the battlefield',
    resource: 'Void',
    accent: 'violet',
    accentBorder: 'border-violet-500',
    accentBg: 'bg-violet-500/20',
    accentText: 'text-violet-400',
  },
  {
    id: 'shadow',
    name: 'Shadow',
    description: 'A stealthy striker who moves unseen and strikes from the darkness',
    resource: 'Insight',
    accent: 'slate',
    accentBorder: 'border-slate-400',
    accentBg: 'bg-slate-400/20',
    accentText: 'text-slate-300',
  },
  {
    id: 'tactician',
    name: 'Tactician',
    description: 'A martial commander who leads allies with battlefield strategies',
    resource: 'Focus',
    accent: 'emerald',
    accentBorder: 'border-emerald-500',
    accentBg: 'bg-emerald-500/20',
    accentText: 'text-emerald-400',
  },
  {
    id: 'talent',
    name: 'Talent',
    description: 'A psionic hero whose mind reshapes reality around them',
    resource: 'Focus',
    accent: 'cyan',
    accentBorder: 'border-cyan-500',
    accentBg: 'bg-cyan-500/20',
    accentText: 'text-cyan-400',
  },
  {
    id: 'troubadour',
    name: 'Troubadour',
    description: 'A charismatic warrior whose performances inspire allies in battle',
    resource: 'Inspiration',
    accent: 'pink',
    accentBorder: 'border-pink-500',
    accentBg: 'bg-pink-500/20',
    accentText: 'text-pink-400',
  },
  {
    id: 'summoner',
    name: 'Summoner',
    description: 'A mystical commander who calls forth creatures to fight alongside them',
    resource: 'Essence',
    accent: 'indigo',
    accentBorder: 'border-indigo-500',
    accentBg: 'bg-indigo-500/20',
    accentText: 'text-indigo-400',
  },
];

export function ClassStep() {
  const classChoice = useCharacterStore((s) => s.character.classChoice);
  const setClassChoice = useCharacterStore((s) => s.setClassChoice);

  const selectedClassId = classChoice?.classId ?? null;

  function handleSelect(id: ClassId) {
    setClassChoice({
      classId: id,
      subclassId: '',
      subclassSkill: '',
      characteristics: { might: 0, agility: 0, reason: 0, intuition: 0, presence: 0 },
      signatureAbilityName: '',
      heroicAbilities: [],
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">Choose Your Class</h2>
        <p className="font-body text-cream-dark/60 mt-2">
          Your class defines your combat role and heroic abilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CLASSES.map((cls) => {
          const isSelected = selectedClassId === cls.id;

          return (
            <div
              key={cls.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(cls.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(cls.id);
                }
              }}
              className={[
                'relative overflow-hidden rounded-2xl p-6 cursor-pointer',
                'bg-gradient-to-br from-surface-light to-surface border-2 transition-all duration-300',
                'hover:scale-[1.02] hover:shadow-xl',
                isSelected
                  ? `${cls.accentBorder} shadow-lg shadow-${cls.accent}-500/20`
                  : 'border-gold-dark/30 hover:border-gold-dark/60',
              ].join(' ')}
            >
              {/* Accent glow on the left edge */}
              <div
                className={[
                  'absolute left-0 top-0 bottom-0 w-1 transition-all duration-300',
                  isSelected ? cls.accentBg.replace('/20', '') : cls.accentBg,
                ].join(' ')}
              />

              {/* Content */}
              <div className="flex flex-col gap-3 pl-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl text-gold-light tracking-wider leading-tight">
                    {cls.name}
                  </h3>
                  <span
                    className={[
                      'shrink-0 px-3 py-1 rounded-full text-xs font-heading font-semibold tracking-wider uppercase',
                      cls.accentBg,
                      cls.accentText,
                    ].join(' ')}
                  >
                    {cls.resource}
                  </span>
                </div>

                <p className="font-body text-sm text-cream-dark/70 leading-relaxed">
                  {cls.description}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className={`w-3 h-3 rounded-full ${cls.accentBg.replace('/20', '')} shadow-lg`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
