#!/bin/bash

# Modified version of the Immich backup script template
# Original: https://docs.immich.app/guides/template-backup-script
# Changes: Uses restic instead of borg, remote backup only, stops/starts server during backup

# Paths
MY_LIBRARY="/mnt/evo/photos/library"

# Get version information for tagging backups
IMMICH_VERSION=$(docker exec immich_server immich-admin version | tail -1)
POSTGRES_VERSION=$(docker exec immich_postgres postgres --version | sed 's/.*PostgreSQL) \([0-9.]*\).*/\1/')

# Stop Immich server to ensure consistent backup
docker stop immich_server

# Backup Immich database (uncompressed for optimal restic deduplication)
# Restic uses content-defined chunking to split files and only backs up changed chunks.
# Compressing the SQL dump would cause even small database changes to alter the entire
# compressed file, preventing restic from deduplicating efficiently.
#
# TODO: Include Immich and Postgres versions in the filename (like built-in backups do)
# This would be helpful when trying to restore data.
docker exec -t immich_postgres pg_dumpall --clean --if-exists --username=postgres > ${MY_LIBRARY}/backups/immich-database-${IMMICH_VERSION}-pg${POSTGRES_VERSION}.sql

### Backup to Restic repository
source /home/amarder/.config/restic/restic-env
restic backup ${MY_LIBRARY} --exclude ${MY_LIBRARY}/thumbs/ --exclude ${MY_LIBRARY}/encoded-video/
restic forget --path ${MY_LIBRARY} --keep-weekly 4 --keep-monthly 3 --prune

# Restart Immich server
docker start immich_server