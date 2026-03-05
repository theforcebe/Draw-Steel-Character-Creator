import { useState } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { WIZARD_STEPS } from '../../types/character';
import type { WizardStepId } from '../../types/character';
import { CharacterPreview } from './CharacterPreview';
import { GoldButton } from '../ui/GoldButton';
import { exportCharacterPdf } from '../../engine/pdf-exporter';

const STEP_LABELS: Record<WizardStepId, string> = {
  welcome: 'Start',
  ancestry: 'Ancestry',
  'ancestry-traits': 'Traits',
  culture: 'Culture',
  career: 'Career',
  class: 'Class',
  subclass: 'Subclass',
  characteristics: 'Stats',
  kit: 'Kit',
  abilities: 'Abilities',
  complication: 'Complication',
  details: 'Details',
  review: 'Review',
};

interface WizardLayoutProps {
  children: React.ReactNode;
}

export function WizardLayout({ children }: WizardLayoutProps) {
  const character = useCharacterStore((s) => s.character);
  const currentStep = useCharacterStore((s) => s.currentStep);
  const setStep = useCharacterStore((s) => s.setStep);
  const nextStep = useCharacterStore((s) => s.nextStep);
  const prevStep = useCharacterStore((s) => s.prevStep);
  const [exporting, setExporting] = useState(false);

  const currentIndex = WIZARD_STEPS.indexOf(currentStep);
  const isWelcome = currentStep === 'welcome';
  const isLast = currentIndex === WIZARD_STEPS.length - 1;

  async function handleExport() {
    setExporting(true);
    try {
      await exportCharacterPdf(character);
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Compact Progress Bar */}
      {!isWelcome && (
        <nav className="shrink-0 border-b border-gold/10 bg-ink/80 px-2 py-2">
          <div className="mx-auto flex max-w-6xl items-center gap-0.5">
            {WIZARD_STEPS.filter((_, i) => i > 0).map((step, i) => {
              const realIndex = i + 1;
              const isPast = realIndex < currentIndex;
              const isCurrent = realIndex === currentIndex;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => isPast && setStep(step)}
                  className={[
                    'flex-1 py-1 text-center font-heading transition-all duration-200 rounded',
                    'text-[0.55rem] sm:text-[0.6rem] tracking-wide',
                    isCurrent
                      ? 'bg-gold/15 text-gold-light font-semibold'
                      : isPast
                        ? 'text-gold-muted hover:text-gold cursor-pointer hover:bg-gold/5'
                        : 'text-cream-dark/30 cursor-default',
                  ].join(' ')}
                >
                  {STEP_LABELS[step]}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1">
        {/* Scrollable Content */}
        <main className={`flex-1 overflow-y-auto ${isWelcome ? '' : 'px-4 py-6 lg:px-8'}`}>
          <div className={isWelcome ? '' : 'mx-auto max-w-4xl'}>
            {children}
          </div>
        </main>

        {/* Sidebar Preview (hidden on welcome + mobile) */}
        {!isWelcome && (
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-gold/10 bg-ink/50 xl:block">
            <CharacterPreview />
          </aside>
        )}
      </div>

      {/* Bottom Nav */}
      {!isWelcome && (
        <footer className="shrink-0 border-t border-gold/10 bg-ink/60 px-4 py-2.5">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <GoldButton variant="secondary" onClick={prevStep}>
              Back
            </GoldButton>
            <span className="font-heading text-[0.6rem] uppercase tracking-widest text-gold-muted">
              {currentIndex} / {WIZARD_STEPS.length - 1}
            </span>
            <GoldButton
              onClick={isLast ? handleExport : nextStep}
              disabled={isLast && exporting}
            >
              {isLast ? (exporting ? 'Exporting...' : 'Export PDF') : 'Continue'}
            </GoldButton>
          </div>
        </footer>
      )}
    </div>
  );
}
