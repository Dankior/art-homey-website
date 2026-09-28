import {sql} from 'drizzle-orm';
import {sqliteTable, text, integer, index, uniqueIndex} from 'drizzle-orm/sqlite-core';
export const requests = sqliteTable('requests', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), budget: text('budget').notNull(),
  name: text('name').notNull().default(''), contact: text('contact').notNull(),
  message: text('message').notNull().default(''), consentVersion: text('consent_version').notNull(),
  createdAt: text('created_at').notNull(),
  submissionKey: text('submission_key'), payloadHash: text('payload_hash'), notifiedAt: text('notified_at'),
  notificationAttempts: integer('notification_attempts').notNull().default(0),
  notificationNextAt: integer('notification_next_at').notNull().default(0),
  notificationLockedUntil: integer('notification_locked_until').notNull().default(0),
}, table => [
  uniqueIndex('requests_submission_key').on(table.submissionKey),
  index('requests_contact_created').on(table.contact, table.createdAt),
  index('requests_pending_notification').on(table.notificationNextAt, table.createdAt).where(sql`${table.notifiedAt} IS NULL`),
]);
