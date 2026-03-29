#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SchoolStack } from '../lib/stack';

const app = new cdk.App();
new SchoolStack(app, 'SchoolStack', {
  env: { region: 'af-south-1' },
});
