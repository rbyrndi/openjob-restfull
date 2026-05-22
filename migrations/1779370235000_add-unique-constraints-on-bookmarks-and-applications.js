exports.up = (pgm) => {
    pgm.addConstraint('bookmarks', 'unique_user_job', {
        unique: ['user_id', 'job_id'],
    });

    pgm.addConstraint('applications', 'unique_user_job', {
        unique: ['user_id', 'job_id'],
    });
};

exports.down = (pgm) => {
    pgm.dropConstraint('applications', 'unique_user_job');
    pgm.dropConstraint('bookmarks', 'unique_user_job');
};