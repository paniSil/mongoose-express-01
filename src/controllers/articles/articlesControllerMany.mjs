import Article from '../../models/Article.mjs';

const postManyArticlesHandler = async (req, res) => {
    try {
        const articles = req.body;
        if (!Array.isArray(articles) || articles.length === 0) {
            return res.status(400).json({ message: 'Provided articles are not in array' });
        }

        const newArticles = articles.map(article => ({
            ...article,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        const result = await Article.insertMany(newArticles);

        res.status(201).json({
            message: `${result.length} articles have been created`,
            insertedIds: result.map(a => a._id)
        });
    } catch (error) {
        console.error('Error while creating articles from array', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const putManyArticlesHandler = async (req, res) => {
    try {
        const { filter, update } = req.body;
        if (!filter || Object.keys(filter).length === 0 || !update || Object.keys(update).length === 0) {
            return res.status(400).json({ message: 'No filter or update was provided' });
        }

        const updateResult = await Article.updateMany(
            filter,
            { $set: { ...update, updatedAt: new Date() } }
        );

        res.status(200).json({
            message: `${updateResult.matchedCount} articles matched, ${updateResult.modifiedCount} articles modified.`,
            matchedCount: updateResult.matchedCount,
            modifiedCount: updateResult.modifiedCount
        });
    } catch (error) {
        console.error('Error while updating articles from array', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteManyArticles = async (req, res) => {
    try {
        const filter = req.body;
        if (!filter || Object.keys(filter).length === 0) {
            return res.status(400).json({ message: 'No filter was provided' });
        }
        const result = await Article.deleteMany(filter);
        res.status(200).json({
            message: `${result.deletedCount} articles deleted`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error while deleting articles', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export { postManyArticlesHandler, putManyArticlesHandler, deleteManyArticles }