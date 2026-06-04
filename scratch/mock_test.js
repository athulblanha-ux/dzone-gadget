const mockProduct = {
  _id: '123',
  name: 'Test Product',
  images: [
    { url: 'https://img1.jpg', publicId: 'd-store/img1' },
    { url: 'https://img2.jpg', publicId: 'd-store/img2' }
  ]
};

// Simulate backend updateProduct logic
async function simulateUpdate(reqBody, reqFiles) {
  const product = mockProduct;
  const data = { ...reqBody };

  let existingImages = product.images || [];
  if (reqBody.existingImages) {
    try {
      const parsedExisting = JSON.parse(reqBody.existingImages);
      const keptPublicIds = new Set(parsedExisting.map(img => img.publicId || img.public_id).filter(Boolean));
      
      // Delete removed images from Cloudinary
      const removedImages = (product.images || []).filter(img => img.publicId && !keptPublicIds.has(img.publicId));
      console.log('Images to delete from Cloudinary:', removedImages.map(img => img.publicId));
      
      existingImages = parsedExisting.map(img => ({
        url: img.url,
        publicId: img.publicId || img.public_id,
        alt: img.alt || product.name
      }));
      
      data.images = existingImages;
    } catch (err) {
      console.error("Error parsing existingImages:", err);
    }
  }

  // Upload new images if provided
  if (reqFiles?.images?.length) {
    const results = reqFiles.images.map((file, i) => ({ secure_url: `https://new-${i}.jpg`, public_id: `d-store/new-${i}` }));
    const newImages = results.map((r, i) => ({
      url: r.secure_url,
      publicId: r.public_id,
      alt: reqBody.name || product.name || `Product image ${existingImages.length + i + 1}`
    }));
    data.images = [...existingImages, ...newImages];
  }

  console.log('Resulting data.images to be saved:', data.images);
}

// Scenario 1: User deleted img2, did not upload new images
console.log('--- Scenario 1 ---');
simulateUpdate({
  existingImages: JSON.stringify([{ url: 'https://img1.jpg', publicId: 'd-store/img1' }])
}, null);

// Scenario 2: User deleted img2, and uploaded a new image
console.log('\n--- Scenario 2 ---');
simulateUpdate({
  existingImages: JSON.stringify([{ url: 'https://img1.jpg', publicId: 'd-store/img1' }])
}, { images: [{ buffer: 'mock' }] });

// Scenario 3: User did not delete anything, only uploaded new image
console.log('\n--- Scenario 3 ---');
simulateUpdate({
  existingImages: JSON.stringify([
    { url: 'https://img1.jpg', publicId: 'd-store/img1' },
    { url: 'https://img2.jpg', publicId: 'd-store/img2' }
  ])
}, { images: [{ buffer: 'mock' }] });
