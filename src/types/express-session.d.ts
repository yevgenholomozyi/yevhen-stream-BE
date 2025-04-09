import { SessionMetadata } from './session-metadata.type'

declare module 'express-session' {
    interface Session {
        createdAt: Date;
        userId: string;
        metadata: SessionMetadata;
    }
} 