# Restore procedure

Never restore directly into production first. Use an isolated test database and a copy of storage.

## Validate

1. Record the archive SHA-256 supplied by the backup report.
2. Run php artisan hafrose:backup:verify BACKUP_ID.
3. Require a valid ZIP, manifest, per-file checksums, and database dump.
4. Run php artisan hafrose:restore BACKUP_ID --target-db=hafrose_restore_test --dry-run.

## Test restore

1. Create an empty, isolated MySQL database such as hafrose_restore_test.
2. Run php artisan hafrose:restore BACKUP_ID --target-db=hafrose_restore_test --no-storage --no-images --force.
3. Point a disposable application instance at that database.
4. Run php artisan migrate:status and application smoke tests.
5. Restore storage/images into an isolated path and compare the manifest checksums.

The image contains mysql/mariadb clients. Database import streams the SQL file to the client; the former statement-by-statement PDO path is not part of the active restore flow. The target database name is restricted to letters, digits, and underscores.

## Production recovery

Obtain explicit approval, stop writes, take a fresh pre-restore backup, verify the chosen archive again, and restore only after the test restore succeeds. Real offsite retrieval and credentials are C1b responsibilities.
