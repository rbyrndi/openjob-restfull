exports.up = (pgm) => {
    pgm.createTable('companies', {
        id: { type: 'VARCHAR(50)', primaryKey: true },
        name: { type: 'VARCHAR(150)', notNull: true },
        description: { type: 'TEXT' },
        website: { type: 'VARCHAR(100)' },
        logo_url: { type: 'TEXT' },
        created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
        updated_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('companies');
};