"""
Read-only DB diagnostics: compares actual PostgreSQL schema to SQLAlchemy models.
Produces detailed report of missing/extra columns, missing tables, FKs, and type mismatches.

Run with: python db_diagnostics.py
"""
from sqlalchemy import inspect
from sqlalchemy.orm import DeclarativeMeta
import database
import models
import sys

engine = database.engine
inspector = inspect(engine)

# Gather actual tables
actual_tables = {}
for table_name in inspector.get_table_names(schema='public'):
    cols = inspector.get_columns(table_name, schema='public')
    fks = inspector.get_foreign_keys(table_name, schema='public')
    actual_tables[table_name] = {
        'columns': {c['name']: c for c in cols},
        'fks': fks
    }

# Gather expected tables from models
expected_tables = {}
for name, obj in models.__dict__.items():
    if isinstance(obj, DeclarativeMeta):
        table = getattr(obj, '__table__', None)
        if table is None:
            continue
        tname = table.name
        expected_tables[tname] = {
            'columns': {},
            'fks': []
        }
        for col in table.columns:
            # collect FK targets
            fk_targets = []
            for fk in col.foreign_keys:
                fk_targets.append({'target_table': fk.column.table.name, 'target_column': fk.column.name})
            expected_tables[tname]['columns'][col.name] = {
                'type': str(col.type),
                'nullable': col.nullable,
                'default': str(col.default.arg) if col.default is not None else None,
                'fks': fk_targets
            }
        # gather table-level fks via inspector later; we rely on column fks here

# Comparison
missing_tables = []
extra_tables = []
missing_columns = {}
extra_columns = {}
col_type_mismatches = {}
missing_fks = {}

# Tables missing or extra
for t in expected_tables:
    if t not in actual_tables:
        missing_tables.append(t)
for t in actual_tables:
    if t not in expected_tables:
        extra_tables.append(t)

# Columns and types
for tname, tinfo in expected_tables.items():
    if tname not in actual_tables:
        continue
    actual_cols = actual_tables[tname]['columns']
    expected_cols = tinfo['columns']
    for ename, ecol in expected_cols.items():
        if ename not in actual_cols:
            missing_columns.setdefault(tname, []).append((ename, ecol))
        else:
            a_col = actual_cols[ename]
            # normalize types: compare using lowercase and simple containment
            a_type = str(a_col.get('type'))
            e_type = ecol['type']
            if e_type.lower() not in a_type.lower() and a_type.lower() not in e_type.lower():
                col_type_mismatches.setdefault(tname, []).append((ename, e_type, a_type))
    for aname in actual_cols:
        if aname not in expected_cols:
            extra_columns.setdefault(tname, []).append((aname, actual_cols[aname]))

# Foreign keys: check expected fks exist in actual inspector list
for tname, tinfo in expected_tables.items():
    if tname not in actual_tables:
        continue
    actual_fks = inspector.get_foreign_keys(tname, schema='public')
    # Build set of (col, target_table, target_column)
    actual_fk_set = set()
    for fk in actual_fks:
        cols = fk.get('constrained_columns') or fk.get('constrained_columns', [])
        refs = fk.get('referred_columns') or fk.get('referred_columns', [])
        # SQLAlchemy inspector returns 'referred_table' and 'referred_columns'
        ref_table = fk.get('referred_table')
        ref_cols = fk.get('referred_columns') or []
        for c, rc in zip(cols, ref_cols):
            actual_fk_set.add((c, ref_table, rc))
    # check expected
    for ename, ecol in tinfo['columns'].items():
        for fk in ecol['fks']:
            expected_trip = (ename, fk['target_table'], fk['target_column'])
            if expected_trip not in actual_fk_set:
                missing_fks.setdefault(tname, []).append(expected_trip)

# Print report
print('\n=== DB DIAGNOSTICS REPORT ===\n')
print('DB URL:', database.SQLALCHEMY_DATABASE_URL)
print('\n-- Tables --')
print('Expected tables (from models):', sorted(expected_tables.keys()))
print('Actual tables (in DB):', sorted(actual_tables.keys()))

print('\n-- Missing tables (expected but not present) --')
for t in missing_tables:
    print('-', t)

print('\n-- Extra tables (present in DB but not in models) --')
for t in extra_tables:
    print('-', t)

print('\n-- Missing columns --')
for t, cols in missing_columns.items():
    print('\nTABLE:', t)
    for name, meta in cols:
        print('  -', name, 'EXPECTED TYPE:', meta['type'], 'NULLABLE:', meta['nullable'], 'DEFAULT:', meta['default'], 'FKS:', meta['fks'])

print('\n-- Extra columns --')
for t, cols in extra_columns.items():
    print('\nTABLE:', t)
    for name, meta in cols:
        print('  -', name, 'ACTUAL TYPE:', meta.get('type'), 'NULLABLE:', meta.get('nullable'), 'DEFAULT:', meta.get('default'))

print('\n-- Column type mismatches --')
for t, mism in col_type_mismatches.items():
    print('\nTABLE:', t)
    for name, etype, atype in mism:
        print('  -', name, 'EXPECTED:', etype, 'ACTUAL:', atype)

print('\n-- Missing foreign keys --')
for t, fks in missing_fks.items():
    print('\nTABLE:', t)
    for fk in fks:
        print('  - Column', fk[0], 'expected FK ->', fk[1]+'.'+fk[2])

# Determine likely DB version age
# Heuristic: if columns from newer models are missing, DB is older
if missing_tables or missing_columns:
    print('\n\nInference: The database schema is missing tables/columns present in models; likely the database is from an older version of the project or migrations were not applied.')
else:
    print('\n\nInference: Database appears in sync with models (no missing tables/columns detected).')

# Detailed note for avistamientos.id_animal
print('\n\n--- Focus: avistamientos.id_animal ---')
if 'avistamientos' in expected_tables:
    exp = expected_tables['avistamientos']['columns'].get('id_animal')
    if exp is None:
        print('Model does NOT expect id_animal column on avistamientos (unexpected).')
    else:
        print('Model EXPECTS:', exp)
        if 'avistamientos' not in actual_tables:
            print('Table avistamientos missing in DB.')
        else:
            if 'id_animal' not in actual_tables['avistamientos']['columns']:
                print('ACTUAL: id_animal column is MISSING in DB (confirmed).')
            else:
                print('ACTUAL: id_animal column exists in DB:', actual_tables['avistamientos']['columns']['id_animal'])

# Exit with success
sys.exit(0)
