# List Databases

`SHOW DATABASES;` is not a PostgreSQL command. In PostgreSQL, use `\l` or `\list` in `psql` to list databases, or query `pg_database` directly.

```sql
SELECT datname FROM pg_database;
```
