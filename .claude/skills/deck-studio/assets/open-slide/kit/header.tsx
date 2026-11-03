import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  type SlideTransition,
  Step,
  Steps,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import { type CSSProperties, type ReactNode, useId } from 'react';

// Built with the deck-studio kit (deck-factory repo, .claude/skills/deck-studio). Blocks between
// "deck-studio:kit" markers are owned by the kit: edit them in the skill and run
// `node scripts/new-deck.mjs --sync` instead of editing them here.
