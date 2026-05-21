const express = require('express');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const documentRoutes = require('./routes/documentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use(userRoutes);
app.use(authRoutes);
app.use(companyRoutes);
app.use(categoryRoutes);
app.use(jobRoutes);
app.use(applicationRoutes);
app.use(bookmarkRoutes);
app.use(documentRoutes);
app.use(profileRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: 'failed',
        message: 'Route not found',
    });
});

app.use(errorHandler);

module.exports = app;