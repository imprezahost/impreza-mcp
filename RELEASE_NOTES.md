# MCP 0.45.0

- Point-in-time PostgreSQL recovery: six tools for status, configuration, a
  recovery drill and a reviewed restore into a new database
  (`impreza_get_pitr`, `impreza_configure_pitr`, `impreza_drill_pitr`,
  `impreza_prepare_pitr_restore`, `impreza_get_pitr_restore`,
  `impreza_apply_pitr_restore`).
- Scheduled tasks match the hosted connector: `impreza_create_task` and
  `impreza_update_task` replace `impreza_schedule_task`. **Breaking:** the old
  name is gone; update clients and prompts that call it.
