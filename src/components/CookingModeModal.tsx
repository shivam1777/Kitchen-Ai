import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Mic,
  ArrowLeft,
  ArrowRight,
  Volume2,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Check,
  ChefHat
} from 'lucide-react';
import { Recipe, RecipeStep } from '../types';
import { soundFx } from '../utils/audio';

interface CookingModeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onFinishCooking?: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  onClose,
  onFinishCooking
}) => {
  const steps: RecipeStep[] =
    recipe.steps && recipe.steps.length > 0
      ? recipe.steps
      : [
          {
            stepNumber: 1,
            totalSteps: 3,
            instruction: 'Gather all required ingredients and prep your workstation.',
            ingredientsNeeded: recipe.ingredientsUsed.map((i) => ({
              name: i.name,
              amount: 'As required'
            }))
          },
          {
            stepNumber: 2,
            totalSteps: 3,
            timerSeconds: 180,
            instruction: 'Follow preparation guidelines and mix ingredients evenly.',
            ingredientsNeeded: recipe.ingredientsUsed.slice(0, 2).map((i) => ({
              name: i.name,
              amount: '1 portion'
            }))
          },
          {
            stepNumber: 3,
            totalSteps: 3,
            instruction: 'Cook to desired tenderness, garnish, and serve hot!',
            ingredientsNeeded: []
          }
        ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex] || steps[0];
  const totalSteps = steps.length;

  // Timer state
  const initialTime = currentStep.timerSeconds || 0;
  const [timerLeft, setTimerLeft] = useState<number>(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  // Checked step ingredients
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Reset timer on step change
  useEffect(() => {
    setTimerLeft(currentStep.timerSeconds || 0);
    setIsTimerRunning(false);
  }, [currentStepIndex, currentStep]);

  // Countdown timer with audio chime when finishing
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play audible chime alert when timer hits 0!
      soundFx.playTimerChime();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerLeft]);

  // Read instruction aloud with Web Speech Synthesis
  const handleSpeakStep = () => {
    soundFx.playTap();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `Step ${currentStepIndex + 1}: ${currentStep.instruction}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNextStep = () => {
    soundFx.playTap();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      soundFx.playSuccessTone();
      if (onFinishCooking) onFinishCooking();
      onClose();
    }
  };

  const handlePrevStep = () => {
    soundFx.playTap();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Toggle ingredient check
  const handleToggleIngredientCheck = (ingName: string) => {
    soundFx.playTap();
    const key = `${currentStepIndex}-${ingName}`;
    setCheckedIngredients((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Voice command simulation
  const triggerVoiceCommand = (command: 'next' | 'back' | 'timer') => {
    soundFx.playTap();
    setVoiceFeedback(`Heard: "${command.toUpperCase()}"`);
    setTimeout(() => setVoiceFeedback(null), 1800);

    if (command === 'next') handleNextStep();
    if (command === 'back') handlePrevStep();
    if (command === 'timer') {
      setIsTimerRunning((prev) => !prev);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F5] text-stone-900 overflow-y-auto flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200">
      {/* Background ambient glowing colorful light accents */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-amber-300/30 to-orange-300/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[450px] h-[450px] bg-gradient-to-tr from-emerald-300/25 to-teal-300/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6 max-w-2xl mx-auto w-full">
          <button
            onClick={() => {
              soundFx.playTap();
              onClose();
            }}
            className="p-2.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer border border-stone-200 shadow-2xs"
            aria-label="Close Cooking Mode"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-orange-600" />
            <span className="font-headline font-black text-xs uppercase tracking-wider text-stone-900 truncate max-w-[200px] md:max-w-[320px]">
              {recipe.title}
            </span>
          </div>

          <button
            onClick={handleSpeakStep}
            className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer border border-orange-200 shadow-2xs"
            title="Read instruction aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress & Timer */}
        <div className="max-w-xl mx-auto w-full mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="font-headline text-2xl font-black text-orange-600 uppercase tracking-tight">
              Step {currentStepIndex + 1}{' '}
              <span className="text-stone-400 text-lg font-normal">/ {totalSteps}</span>
            </div>

            {currentStep.timerSeconds && currentStep.timerSeconds > 0 && (
              <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-mono font-bold text-sm text-stone-900">
                  {formatTime(timerLeft)}
                </span>
                <button
                  onClick={() => {
                    soundFx.playTap();
                    setIsTimerRunning(!isTimerRunning);
                  }}
                  className="p-1 hover:bg-orange-50 rounded-full cursor-pointer ml-1 text-orange-600"
                  title={isTimerRunning ? 'Pause timer' : 'Start timer'}
                >
                  {isTimerRunning ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-orange-500" />
                  )}
                </button>
                <button
                  onClick={() => {
                    soundFx.playTap();
                    setTimerLeft(currentStep.timerSeconds || 0);
                    setIsTimerRunning(false);
                  }}
                  className="p-1 hover:bg-stone-100 rounded-full cursor-pointer text-stone-400"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden border border-stone-200">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300 rounded-full shadow-xs"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Instruction */}
        <div className="max-w-xl mx-auto w-full my-6 text-center">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/90 shadow-lg">
            <h2 className="font-headline font-black text-2xl md:text-3xl text-stone-900 leading-snug tracking-tight">
              {currentStep.instruction}
            </h2>
          </div>
        </div>

        {/* Ingredient Checklist for this step */}
        {currentStep.ingredientsNeeded && currentStep.ingredientsNeeded.length > 0 && (
          <div className="max-w-xl mx-auto w-full mb-6">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 text-center mb-3">
              [ INGREDIENTS PREPARED FOR THIS STEP ]
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {currentStep.ingredientsNeeded.map((ing, idx) => {
                const isChecked = !!checkedIngredients[`${currentStepIndex}-${ing.name}`];
                return (
                  <button
                    key={idx}
                    onClick={() => handleToggleIngredientCheck(ing.name)}
                    className={`px-3.5 py-2 rounded-2xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 line-through opacity-75'
                        : 'bg-white text-stone-800 border-stone-200 hover:border-orange-300 shadow-2xs'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-emerald-600 text-white' : 'border border-stone-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </span>
                    <span>
                      {ing.amount} {ing.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 max-w-xl mx-auto w-full space-y-4 pt-4">
        {/* Voice Control Bar */}
        <div className="bg-white rounded-full p-2.5 px-4 flex items-center justify-between shadow-md border border-stone-200">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-700">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="truncate max-w-[140px] md:max-w-none">
              {voiceFeedback || 'Voice Assisted: "Next", "Back"'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => triggerVoiceCommand('back')}
              className="px-2.5 py-1 bg-stone-100 text-stone-700 text-[10px] font-mono font-bold rounded-full hover:bg-stone-200 cursor-pointer"
            >
              "Back"
            </button>
            <button
              onClick={() => triggerVoiceCommand('next')}
              className="px-2.5 py-1 bg-orange-50 text-orange-600 text-[10px] font-mono font-bold rounded-full hover:bg-orange-100 cursor-pointer border border-orange-200"
            >
              "Next"
            </button>
            {currentStep.timerSeconds && (
              <button
                onClick={() => triggerVoiceCommand('timer')}
                className="px-2.5 py-1 bg-stone-100 text-stone-700 text-[10px] font-mono font-bold rounded-full hover:bg-stone-200 cursor-pointer"
              >
                "Timer"
              </button>
            )}
          </div>
        </div>

        {/* Back / Next Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="py-4 px-6 bg-white text-stone-700 font-headline font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-stone-50 border border-stone-200 disabled:opacity-30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNextStep}
            className="py-4 px-6 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-headline font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-orange-500/25"
          >
            {currentStepIndex === totalSteps - 1 ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                Finish Cooking 🎉
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
