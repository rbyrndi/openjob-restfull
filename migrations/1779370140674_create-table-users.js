exports.up = (pgm) => {
    pgm.createTable('users', {
        id: { type: 'VARCHAR(50)', primaryKey: true },
        email: { type: 'VARCHAR(100)', notNull: true, unique: true }, // Unique constraint (Skilled)
        password: { type: 'TEXT', notNull: true },
        full_name: { type: 'VARCHAR(150)', notNull: true },
        created_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
        updated_at: { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('current_timestamp') },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('users');
};