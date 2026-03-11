import { lazy, Suspense } from 'react';
import { WizardLayout } from './components/wizard/WizardLayout';
import { useCharacterStore } from './stores/character-store';
import { WelcomeStep } from './components/steps/WelcomeStep';
import { AncestryStep } from './components/steps/AncestryStep';
import { AncestryTraitsStep } from './components/steps/AncestryTraitsStep';
import { CultureStep } from './components/steps/CultureStep';
import { CareerStep } from './components/steps/CareerStep';
import { ClassStep } from './components/steps/ClassStep';
import { SubclassStep } from './components/steps/SubclassStep';
import { CharacteristicsStep } from './components/steps/CharacteristicsStep';
import { KitStep } from './components/steps/KitStep';
import { AbilitiesStep } from './components/steps/AbilitiesStep';
import { ComplicationStep } from './components/steps/ComplicationStep';
import { DetailsStep } from './components/steps/DetailsStep';
import { ModelStep } from './components/steps/ModelStep';
import { ReviewStep } from './components/steps/ReviewStep';

/* ── Lazy-loaded: Play Mode is only needed after character creation ── */
const LazyPlayMode = lazy(() =>
  import('./components/play/PlayMode').then((m) => ({ default: m.PlayMode }))
);

function PlayModeLoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
        <p className="font-heading text-sm uppercase tracking-wider text-gold-muted">
          Loading Play Mode...
        </p>
      </div>
    </div>
  );
}

function StepRouter() {
  const currentStep = useCharacterStore((s) => s.currentStep);

  switch (currentStep) {
    case 'welcome':
      return <WelcomeStep />;
    case 'ancestry':
      return <AncestryStep />;
    case 'ancestry-traits':
      return <AncestryTraitsStep />;
    case 'culture':
      return <CultureStep />;
    case 'career':
      return <CareerStep />;
    case 'class':
      return <ClassStep />;
    case 'subclass':
      return <SubclassStep />;
    case 'characteristics':
      return <CharacteristicsStep />;
    case 'kit':
      return <KitStep />;
    case 'abilities':
      return <AbilitiesStep />;
    case 'complication':
      return <ComplicationStep />;
    case 'details':
      return <DetailsStep />;
    case 'model':
      return <ModelStep />;
    case 'review':
      return <ReviewStep />;
    default:
      return null;
  }
}

export function App() {
  const mode = useCharacterStore((s) => s.mode);

  if (mode === 'play') {
    return (
      <Suspense fallback={<PlayModeLoadingFallback />}>
        <LazyPlayMode />
      </Suspense>
    );
  }

  return (
    <WizardLayout>
      <StepRouter />
    </WizardLayout>
  );
}
