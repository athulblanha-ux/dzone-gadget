const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Blog title is required'], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    content: { type: String, required: [true, 'Blog content is required'] },
    excerpt: { type: String, maxlength: 500 },
    coverImage: {
      url: { type: String, default: '' },
      publicId: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{ type: String, lowercase: true }],
    category: { type: String, default: 'general' },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    isFeatured: { type: Boolean, default: false },
    readTime: { type: Number, default: 5 }, // minutes
    views: { type: Number, default: 0 },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  // Auto-calculate read time (~200 words/min)
  if (this.isModified('content') && this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: 'text', content: 'text' });

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
