exports.up = (pgm) => {
    pgm.createTable('documents', {
        id: { type: 'VARCHAR(50)', primaryKey: true },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
        },
        name: { type: 'VARCHAR(150)', notNull: true },
        file_url: { type: 'TEXT', notNull: true },
        created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
        updated_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('documents');
};