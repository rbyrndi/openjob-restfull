exports.up = (pgm) => {
    pgm.createTable('jobs', {
        id: { type: 'VARCHAR(50)', primaryKey: true },
        company_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"companies"',
            onDelete: 'CASCADE',
        },
        category_id: {
            type: 'VARCHAR(50)',
            references: '"categories"',
            onDelete: 'SET NULL',
        },
        title: { type: 'VARCHAR(150)', notNull: true },
        description: { type: 'TEXT', notNull: true },
        salary: { type: 'INT' },
        location: { type: 'VARCHAR(100)', notNull: true },
        created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
        updated_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('jobs');
};