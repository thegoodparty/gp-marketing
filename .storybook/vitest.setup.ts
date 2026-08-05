import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/nextjs-vite';
import * as projectAnnotations from './preview';

// Applies the Storybook preview (decorators, parameters, etc.) to every
// story-as-test run by the Vitest addon.
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
