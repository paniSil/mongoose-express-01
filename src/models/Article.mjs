import mongoose from 'mongoose'

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Article title is required'],
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [120, 'Title cannot be more than 100 characters long'],
        unique: [true, "Title is already exists"],
        trim: true
    },
    text: { type: String, required: [true, 'Article text is required'], minlength: [3, 'Text must be at least 3 characters long'] }

}, { timestamps: true })

ArticleSchema.index({ title: 1 });

const Article = mongoose.model('Article', ArticleSchema)
export default Article

