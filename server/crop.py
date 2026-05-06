import os
from PIL import Image

data_dir = '/Users/zeus/.gemini/antigravity/brain/d17867b2-f412-4c93-92e2-4174f10dd991/'
img1 = Image.open(os.path.join(data_dir, 'media__1777910056592.png'))
img2 = Image.open(os.path.join(data_dir, 'media__1777910078979.png'))
img3 = Image.open(os.path.join(data_dir, 'media__1777910096009.png'))

os.makedirs('/Users/zeus/Desktop/DSTORE/client/public/images/products', exist_ok=True)

def crop_and_save(img, num_items, prefix):
    w, h = img.size
    item_h = h // num_items
    for i in range(num_items):
        pad = int(item_h * 0.05)
        sq = item_h - 2*pad
        box = (pad, i*item_h + pad, pad + sq, i*item_h + pad + sq)
        cropped = img.crop(box)
        # Convert to RGB to save as JPEG
        cropped = cropped.convert('RGB')
        cropped.save(f'/Users/zeus/Desktop/DSTORE/client/public/images/products/{prefix}_{i+1}.jpg', 'JPEG')

crop_and_save(img1, 5, 'batch1')
crop_and_save(img2, 7, 'batch2')
crop_and_save(img3, 6, 'batch3')
