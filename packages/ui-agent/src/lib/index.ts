import { createDbs } from './dbs';
import { setupAgentMessageBusProcessor } from '@gpt-team/channel';
import * as path from 'path';

const mqUrl = 'amqp://localhost';

const basePath = path.join(process.cwd(), 'agents', 'ui-agent', 'db');

const team = {
  name: 'ui',
};

// Start processing project descriptions
setupAgentMessageBusProcessor({ basePath, mqUrl, createDbs, team });
