import Article from '../../models/Article.mjs'

const findArticleByTitle = async (title) => {
    return await Article.findOne({ title });
}

const createArticleInDb = async (title, text) => {
    const newArticle = new Article({
        title,
        text,
    });

    const result = await newArticle.save();
    return result;
}

export { findArticleByTitle, createArticleInDb }