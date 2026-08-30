'use client';

import type { ComponentType } from 'react';
import type { EraId, SceneKey } from '@/lib/content';
import type { SceneProps } from './shared';

import {
  AlgorithmAuction,
  BridgeWars,
  CaptureTheFlag,
  EscapeTheServer,
  TechMinute,
} from './technical';
import {
  ArrayPataHai,
  NexusNegotiator,
  ParallelProtocol,
  SecretSeekers,
  TechTunes,
} from './nontechnical';
import { FIFA, MortalKombat, Tekken, Valorant } from './esports';
import { InterfaceQuest, QuestToCinema, RoboRace, RoboSoccer, ThroughTheLens } from './era4';
import { GameAthon } from './nextgen';

export interface SceneEntry {
  Component: ComponentType<SceneProps>;
  era: EraId;
  /** Camera distance — each object is authored at its own scale. */
  dist: number;
  /** Vertical framing offset. */
  y?: number;
}

export const SCENES: Record<SceneKey, SceneEntry> = {
  captureTheFlag: { Component: CaptureTheFlag, era: 1, dist: 5.4, y: -0.1 },
  escapeTheServer: { Component: EscapeTheServer, era: 1, dist: 4.6 },
  bridgeWars: { Component: BridgeWars, era: 1, dist: 4.4, y: -0.05 },
  algorithmAuction: { Component: AlgorithmAuction, era: 1, dist: 4.6, y: -0.15 },
  techMinute: { Component: TechMinute, era: 1, dist: 5.0 },

  techTunes: { Component: TechTunes, era: 3, dist: 5.2 },
  parallelProtocol: { Component: ParallelProtocol, era: 3, dist: 4.6 },
  nexusNegotiator: { Component: NexusNegotiator, era: 3, dist: 5.0 },
  arrayPataHai: { Component: ArrayPataHai, era: 3, dist: 5.2 },
  secretSeekers: { Component: SecretSeekers, era: 3, dist: 4.8 },

  valorant: { Component: Valorant, era: 2, dist: 4.8 },
  fifa: { Component: FIFA, era: 2, dist: 5.0, y: 0.2 },
  mortalKombat: { Component: MortalKombat, era: 2, dist: 5.2, y: 0.25 },
  tekken: { Component: Tekken, era: 2, dist: 4.4, y: 0.05 },

  roboSoccer: { Component: RoboSoccer, era: 4, dist: 5.0 },
  roboRace: { Component: RoboRace, era: 4, dist: 4.8 },
  throughTheLens: { Component: ThroughTheLens, era: 4, dist: 4.8 },
  questToCinema: { Component: QuestToCinema, era: 4, dist: 4.6 },
  interfaceQuest: { Component: InterfaceQuest, era: 4, dist: 4.4 },

  gameAthon: { Component: GameAthon, era: 5, dist: 5.2 },
};
