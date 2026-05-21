const formatUser = (row) => ({
    id: row.id,
    name: row.full_name,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

const formatCompany = (row) => ({
    id: row.id,
    name: row.name,
    location: row.location,
    description: row.description,
    website: row.website,
    logo_url: row.logo_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

const formatCategory = (row) => ({
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

const formatJob = (row) => ({
    id: row.id,
    company_id: row.company_id,
    company_name: row.company_name,
    category_id: row.category_id,
    category_name: row.category_name,
    title: row.title,
    description: row.description,
    job_type: row.job_type,
    experience_level: row.experience_level,
    location_type: row.location_type,
    location_city: row.location_city,
    salary: row.salary,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    is_salary_visible: row.is_salary_visible,
    location: row.location,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

const formatApplication = (row) => ({
    id: row.id,
    user_id: row.user_id,
    job_id: row.job_id,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

const formatBookmark = (row) => ({
    id: row.id,
    user_id: row.user_id,
    job_id: row.job_id,
    created_at: row.created_at,
});

const formatDocument = (row) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    file_url: row.file_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

module.exports = {
    formatUser,
    formatCompany,
    formatCategory,
    formatJob,
    formatApplication,
    formatBookmark,
    formatDocument,
};