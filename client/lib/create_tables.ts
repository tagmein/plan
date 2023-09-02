import { run_query } from './run_query'

export async function create_tables() {
 const [result_documents, result_events, result_tabs] = await Promise.all([
  run_query(`
CREATE TABLE IF NOT EXISTS documents (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT,
 description TEXT,
 external_id TEXT,
 parent_id INTEGER,
 is_required BOOLEAN DEFAULT 0,
 is_visible BOOLEAN DEFAULT 1,
 is_completed BOOLEAN DEFAULT 0,
 is_abandoned BOOLEAN DEFAULT 0,
 is_trashed BOOLEAN DEFAULT 0,
 priority INTEGER DEFAULT 0,
 FOREIGN KEY (parent_id) REFERENCES documents(id)
);
`),
  run_query(`
CREATE TABLE IF NOT EXISTS events (
 document_id INTEGER NOT NULL,
 start_date DATE NOT NULL,
 start_time_minutes INTEGER NOT NULL DEFAULT 0,
 duration_minutes INTEGER NOT NULL DEFAULT 60,
 muted BOOLEAN DEFAULT 0,
 repeat_until_date DATE,
 repeat_daily BOOLEAN DEFAULT 0,
 repeat_weekly BOOLEAN DEFAULT 0,
 repeat_weekly_days INTEGER,
 repeat_monthly BOOLEAN DEFAULT 0,
 repeat_quarterly BOOLEAN DEFAULT 0,
 repeat_yearly BOOLEAN DEFAULT 0,
 FOREIGN KEY (document_id) REFERENCES documents(id)
);
`),
  run_query(`
CREATE TABLE IF NOT EXISTS tabs (
 document_ids INTEGER[] NOT NULL,
 is_pinned BOOLEAN NOT NULL DEFAULT 0,
 is_archived BOOLEAN NOT NULL DEFAULT 0,
 tab_order INTEGER NOT NULL DEFAULT 0
);
 `),
 ])
 const error: string[] = []
 if (result_documents.error) {
  error.push('unable to create_tables: documents')
 }
 if (result_events.error) {
  error.push('unable to create_tables: events')
 }
 if (result_tabs.error) {
  error.push('unable to create_tables: tabs')
 }
 if (error.length) {
  throw new Error(error.join('; '))
 }
}
