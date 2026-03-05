import { useCharacterStore } from '../../stores/character-store';

export function DetailsStep() {
  const name = useCharacterStore((s) => s.character.name);
  const appearance = useCharacterStore((s) => s.character.appearance);
  const backstory = useCharacterStore((s) => s.character.backstory);
  const setName = useCharacterStore((s) => s.setName);
  const setAppearance = useCharacterStore((s) => s.setAppearance);
  const setBackstory = useCharacterStore((s) => s.setBackstory);

  const inputClasses = [
    'w-full rounded-2xl px-4 py-3',
    'bg-surface-light border border-gold/20',
    'text-cream font-body text-base placeholder:text-cream-dark/30',
    'focus:outline-none focus:border-gold focus:shadow-[0_0_12px_rgba(201,168,76,0.2)]',
    'transition-all duration-200',
  ].join(' ');

  const labelClasses = 'font-heading text-sm uppercase tracking-wider text-gold-muted';

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-gold tracking-wide">Character Details</h2>
        <p className="font-body text-cream-dark/60 mt-2">
          Give your hero a name and bring them to life with description and history.
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        {/* Character Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="char-name" className={labelClasses}>
            Character Name
          </label>
          <input
            id="char-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What shall your hero be called?"
            className={inputClasses}
          />
        </div>

        {/* Appearance */}
        <div className="flex flex-col gap-2">
          <label htmlFor="char-appearance" className={labelClasses}>
            Appearance
          </label>
          <textarea
            id="char-appearance"
            value={appearance}
            onChange={(e) => setAppearance(e.target.value)}
            placeholder="Describe your hero's physical appearance, clothing, and distinguishing features..."
            rows={4}
            className={`${inputClasses} resize-y min-h-[100px]`}
          />
        </div>

        {/* Backstory */}
        <div className="flex flex-col gap-2">
          <label htmlFor="char-backstory" className={labelClasses}>
            Backstory
          </label>
          <textarea
            id="char-backstory"
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            placeholder="What is your hero's history? What drives them to adventure?"
            rows={6}
            className={`${inputClasses} resize-y min-h-[150px]`}
          />
        </div>
      </div>
    </div>
  );
}
